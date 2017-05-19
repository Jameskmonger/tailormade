const { parse } = require('scss-parser');
const createQueryWrapper = require('query-ast');

export default (content: string) => createQueryWrapper(parse(content));