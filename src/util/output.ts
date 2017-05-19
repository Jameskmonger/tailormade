import * as fs from "fs";
import * as path from "path";
import format from "./format";
const mkdirp = require("mkdirp");

export default (
    content: string, 
    outputPath: string, 
    type: "design" | "structural", 
    designProperties: Array<string>
) => {
    mkdirp(path.dirname(outputPath), (err) => {
        if (err) throw err;

        fs.writeFile(
            outputPath,
            format(content, { type, designProperties }),
            (err) => {
                if (err) throw err;

                console.log(`Written ${type} output to ${outputPath}`);
            }
        );
    });
};