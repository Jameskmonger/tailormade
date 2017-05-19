import * as sass from "./sass/";

const getPredicate = (type: "design" | "structural", designProperties: Array<string>) => {
    const designPredicate = (prop: string) => designProperties.indexOf(prop) === -1;
    const structuralPredicate = (prop: string) => designProperties.indexOf(prop) !== -1;

    return (type === "design") ? designPredicate : structuralPredicate;
}

export default (fileContents: string, options: { 
    type: "design" | "structural";
    designProperties: Array<string>;
}) => {
    const ast = sass.parse(fileContents);
    const predicate = getPredicate(options.type, options.designProperties);

    sass.ast.filterProperties(ast, predicate);
    sass.ast.removeEmptyRules(ast);

    return sass.stringify(ast);
};
