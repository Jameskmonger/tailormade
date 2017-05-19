import * as path from "path";

export default (fileName: string, insertion: string) => {
    const dir = path.dirname(fileName);
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);

    return path.resolve(dir, base + insertion + ext);
};