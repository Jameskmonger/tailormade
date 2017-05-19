const { stringify } = require('scss-parser');
import beautify from "./beautify";

export default (ast: any) => beautify(stringify(ast().get(0)));