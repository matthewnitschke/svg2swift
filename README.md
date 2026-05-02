# svg2swift

A basic CLI that takes a svg as an input, and outputs the a swift UI NSImage representation using GCMutablePath

```sh
$ bun ./src/main.ts ./path/to/image.svg

func createIconImage(size: NSSize = NSSize(width: 1024, height: 1024)) -> NSImage {
  let image = NSImage(size: size)
  // ...

  let path = GCMutablePath()
  path.move(to ....)
  path.addCurve(....)
  // ...

  return image
}
```

## Why does this exist?

I've had a lot of trouble building menubar applications in swift, getting the right image icon. SFSymbols is too complicated, its annoying dealing with static assets, and I just want it "to work"

svg2swift is a hack to get around my issues, letting me just take a svg I can create in figma, and output the swift code that can recreate that image

There might be a better, less custom way to do this, but it works for me