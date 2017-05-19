const filterProperties = (astQuery: any, predicate: (propertyName: string) => boolean) => {
    // filter out disallowed properties
    astQuery("property").filter(property => {
        // get the identifier name from the property ('color', 'width', etc)
        const identifier = astQuery(property).find("identifier").value();
        
        // see if the predicate passes    
        return predicate(identifier);
    }).parent().remove();
};

const removeEmptyRules = (astQuery: any) => {
    // filter out rules without any declarations
    astQuery("rule").filter(rule => {
        return astQuery(rule).find("declaration").length() === 0;
    }).remove();
};

export {
    filterProperties,
    removeEmptyRules
};
