import { readFileSync } from "fs";

const svg = readFileSync(process.argv[2], "utf-8");
const funcName = process.argv[3] || "createImage";

const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1].split(/\s+/).map(Number) || [0, 0, 36, 36];
const w = viewBox[2], h = viewBox[3];

const paths = [...svg.matchAll(/d="([^"]+)"/g)].map(m => m[1]);

let swift = `func ${funcName}(size: NSSize = NSSize(width: ${w}, height: ${h})) -> NSImage {
    let image = NSImage(size: size)
    image.addRepresentation(NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: Int(size.width),
        pixelsHigh: Int(size.height),
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!)

    image.lockFocus()
    image.isTemplate = true

    let context = NSGraphicsContext.current!.cgContext
    let scaleX = size.width / ${w}.0
    let scaleY = size.height / ${h}.0

    let path = CGMutablePath()
`;

for (const d of paths) {
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  let i = 0, cx = 0, cy = 0;
  let startX = 0, startY = 0;

  while (i < tokens.length) {
    const t = tokens[i++];
    switch (t) {
      case 'M':
        cx = +tokens[i++]; cy = +tokens[i++];
        startX = cx; startY = cy;
        swift += `    path.move(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY))\n`;
        break;
      case 'm':
        cx += +tokens[i++]; cy += +tokens[i++];
        startX = cx; startY = cy;
        swift += `    path.move(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY))\n`;
        break;
      case 'L':
        cx = +tokens[i++]; cy = +tokens[i++];
        swift += `    path.addLine(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY))\n`;
        break;
      case 'l':
        cx += +tokens[i++]; cy += +tokens[i++];
        swift += `    path.addLine(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY))\n`;
        break;
      case 'H':
        cx = +tokens[i++];
        swift += `    path.addLine(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY))\n`;
        break;
      case 'h':
        cx += +tokens[i++];
        swift += `    path.addLine(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY))\n`;
        break;
      case 'V':
        cy = +tokens[i++];
        swift += `    path.addLine(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY))\n`;
        break;
      case 'v':
        cy += +tokens[i++];
        swift += `    path.addLine(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY))\n`;
        break;
      case 'C': {
        const c1x = +tokens[i++], c1y = +tokens[i++];
        const c2x = +tokens[i++], c2y = +tokens[i++];
        cx = +tokens[i++]; cy = +tokens[i++];
        swift += `    path.addCurve(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY), control1: CGPoint(x: ${c1x} * scaleX, y: (${h} - ${c1y}) * scaleY), control2: CGPoint(x: ${c2x} * scaleX, y: (${h} - ${c2y}) * scaleY))\n`;
        break;
      }
      case 'c': {
        const c1x = cx + +tokens[i++], c1y = cy + +tokens[i++];
        const c2x = cx + +tokens[i++], c2y = cy + +tokens[i++];
        cx += +tokens[i++]; cy += +tokens[i++];
        swift += `    path.addCurve(to: CGPoint(x: ${cx} * scaleX, y: (${h} - ${cy}) * scaleY), control1: CGPoint(x: ${c1x} * scaleX, y: (${h} - ${c1y}) * scaleY), control2: CGPoint(x: ${c2x} * scaleX, y: (${h} - ${c2y}) * scaleY))\n`;
        break;
      }
      case 'Z':
      case 'z':
        swift += `    path.closeSubpath()\n`;
        cx = startX; cy = startY;
        break;
    }
  }
}

swift += `    context.setFillColor(NSColor.black.cgColor)
    context.addPath(path)
    context.fillPath()
    image.unlockFocus()
    return image
}`;

console.log(swift);
