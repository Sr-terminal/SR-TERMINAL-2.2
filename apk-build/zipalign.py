#!/usr/bin/env python3
"""
Minimal zipalign-compatible APK repacker for the SR Terminal no-Gradle build.

Takes an aapt2-produced APK, appends classes.dex, and writes a fresh ZIP:
  * resources.arsc is forced STORED (uncompressed) — required by Android 11+
  * all STORED entries are 4-byte aligned (like `zipalign -f 4`)
  * everything else keeps its original compression method
  * entry order is preserved (AndroidManifest.xml stays first)

Only depends on the Python standard library.
"""
import struct
import sys
import zlib


def read_entries(path):
    with open(path, "rb") as f:
        buf = f.read()

    eocd_off = buf.rfind(b"PK\x05\x06")
    if eocd_off < 0:
        raise SystemExit("no EoCD found in %s" % path)

    cd_size, cd_off = struct.unpack_from("<II", buf, eocd_off + 12)
    pos = cd_off

    entries = []  # (name, method, data_bytes_uncompressed)
    while pos < cd_off + cd_size:
        if buf[pos:pos + 4] != b"PK\x01\x02":
            raise SystemExit("bad central directory entry at %d" % pos)
        (method,) = struct.unpack_from("<H", buf, pos + 10)
        (crc, csize, usize) = struct.unpack_from("<III", buf, pos + 16)
        (fnlen, extralen, commentlen) = struct.unpack_from("<HHH", buf, pos + 28)
        (lho,) = struct.unpack_from("<I", buf, pos + 42)
        name = buf[pos + 46: pos + 46 + fnlen].decode("utf-8")

        # locate data via the LOCAL header (its name/extra lengths can differ)
        (lfnlen, lextralen) = struct.unpack_from("<HH", buf, lho + 26)
        data_start = lho + 30 + lfnlen + lextralen
        raw = buf[data_start: data_start + csize]

        if method == 0:
            data = raw
        elif method == 8:
            data = zlib.decompress(raw, -15)
        else:
            raise SystemExit("unsupported compression method %d for %s" % (method, name))

        if len(data) != usize:
            raise SystemExit("size mismatch for %s" % name)

        entries.append((name, method, data))
        pos += 46 + fnlen + extralen + commentlen

    return entries


def dos_time():
    # fixed timestamp: 2026-01-01 00:00:00 -> dos date/time
    return (0 << 11) | (0 << 5) | 0, ((2026 - 1980) << 9) | (1 << 5) | 1


def write_zip(path, entries, align=4):
    dtime, ddate = dos_time()
    out = bytearray()
    central = bytearray()

    for name, method, data in entries:
        nameb = name.encode("utf-8")
        crc = zlib.crc32(data) & 0xFFFFFFFF

        if method == 8:
            co = zlib.compressobj(9, zlib.DEFLATED, -15)
            blob = co.compress(data) + co.flush()
        else:
            blob = data

        extra = b""
        if method == 0:
            data_off = len(out) + 30 + len(nameb)
            pad = (align - (data_off % align)) % align
            extra = b"\x00" * pad

        offset = len(out)
        out += struct.pack(
            "<IHHHHHIIIHH",
            0x04034B50,  # local file header signature
            20,          # version needed
            0x0800,      # flags: UTF-8 names
            method,
            dtime,
            ddate,
            crc,
            len(blob),
            len(data),
            len(nameb),
            len(extra),
        )
        out += nameb
        out += extra
        out += blob

        central += struct.pack(
            "<IHHHHHHIIIHHHHHII",
            0x02014B50,        # central dir signature
            (3 << 8) | 20,     # made by: unix, 2.0
            20,                # extract version
            0x0800,            # flags
            method,
            dtime,
            ddate,
            crc,
            len(blob),
            len(data),
            len(nameb),
            0,                 # extra len (no padding info needed in CD)
            0,                 # comment len
            0,                 # disk number
            0,                 # internal attrs
            (0o100644 << 16),  # external attrs: -rw-r--r--
            offset,
        )
        central += nameb

    out += central
    out += struct.pack(
        "<IHHHHIIH",
        0x06054B50,
        0,
        0,
        len(entries),
        len(entries),
        len(central),
        len(out) - len(central),
        0,
    )

    with open(path, "wb") as f:
        f.write(bytes(out))


def main():
    if len(sys.argv) != 4:
        print("usage: zipalign.py <in.apk> <classes.dex> <out.apk>")
        return 1

    in_apk, dex_path, out_apk = sys.argv[1], sys.argv[2], sys.argv[3]

    entries = read_entries(in_apk)

    # resources.arsc must be stored (uncompressed) on Android 11+
    fixed = []
    for name, method, data in entries:
        if name == "resources.arsc" and method != 0:
            print("  forcing resources.arsc to STORED")
            method = 0
        fixed.append((name, method, data))

    # append classes.dex (stored + aligned, like AGP does)
    with open(dex_path, "rb") as f:
        dex = f.read()
    if not any(name == "classes.dex" for name, _, _ in fixed):
        fixed.append(("classes.dex", 0, dex))

    write_zip(out_apk, fixed)

    # sanity: verify with python's zipfile
    import zipfile
    with zipfile.ZipFile(out_apk) as z:
        bad = z.testzip()
        if bad is not None:
            raise SystemExit("zip verification failed at %s" % bad)
        print("  %d entries, verification OK -> %s" % (len(fixed), out_apk))
    return 0


if __name__ == "__main__":
    sys.exit(main())
