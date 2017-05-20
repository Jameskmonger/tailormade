#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
const normalizeNewline = require('normalize-newline');
import { output, args } from "./util";

const inputPath = path.resolve(process.cwd(), args.input);
const structuralPath = path.resolve(process.cwd(), args.structuralOutput);
const designPath = path.resolve(process.cwd(), args.designOutput);
const designProperties = args.designProperties;

fs.readFile(inputPath, (err: NodeJS.ErrnoException, data: Buffer) => {
    if (err) {
        if (err.code === "ENOENT") {
            console.log(`File ${inputPath} not found.`);
            return;
        }

        throw err;
    }
    
    const content = normalizeNewline(data.toString());

    output(content, structuralPath, "structural", designProperties);
    output(content, designPath, "design", designProperties);
});
