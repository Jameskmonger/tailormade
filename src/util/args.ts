import * as yargs from "yargs";
import DESIGN_PROPERTIES from "../design-properties";
import insertBeforeExtension from "./insert-before-extension";

const args = 
    yargs.usage("Usage: $0 app.scss -s app.structural.scss -d app.design.scss -p 'color' 'background-color'")
        .demandCommand(1)
        .array("p")
        .default("p", DESIGN_PROPERTIES)
        .describe("s", "Relative file path for the structural style output")
        .describe("d", "Relative file path for the design style output")
        .describe("p", "An array of properties used for design styling")
        .argv;

const input = args._[0];
const structuralOutput = args.s || insertBeforeExtension(input, ".structural");
const designOutput = args.d || insertBeforeExtension(input, ".design");
const designProperties = args.p;

export {
    input,
    structuralOutput,
    designOutput,
    designProperties
};
