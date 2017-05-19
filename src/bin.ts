#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import * as yargs from "yargs";
import format from "./format";
import DESIGN_PROPERTIES from "./design-properties";
const normalizeNewline = require('normalize-newline');
const mkdirp = require("mkdirp");

const args = 
    yargs.usage("Usage: $0 app.scss -s app.structural.scss -d app.design.scss -p 'color' 'background-color'")
        .demandCommand(1)
        .demandOption(["s", "d"])
        .array("p")
        .default("p", DESIGN_PROPERTIES)
        .describe("s", "Relative file path for the structural style output")
        .describe("d", "Relative file path for the design style output")
        .describe("p", "An array of properties used for design styling")
        .argv;

const inputPath = path.resolve(process.cwd(), args._[0]);
const structuralPath = path.resolve(process.cwd(), args.s);
const designPath = path.resolve(process.cwd(), args.d);
const designProperties = args.p;

const transform = (content: string, outputPath: string, type: "design" | "structural") => {
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
}

fs.readFile(inputPath, (err: Error, data: Buffer) => {
    const content = normalizeNewline(data.toString());

    transform(content, structuralPath, "structural");
    transform(content, designPath, "design");
});