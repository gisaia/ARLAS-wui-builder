/**
 * Get object or String value of an object from key
 */
export function getObject(datalayer: any, objectKey: string) {
    // if datalayer doesn't exists, just return
    if (!datalayer) {
        return null;
    }
    // default return datalayer
    let current = datalayer;
    // check every layer
    if (typeof objectKey === 'string') {
        const numberOfObjectHierarchy = objectKey.match(/\./g).length;
        for (let i = 1; i <= numberOfObjectHierarchy; i++) {
            const currentKey = objectKey.split(/\./)[i];
            if (typeof current[currentKey] === 'undefined') {
                return null;
            }
            current = current[currentKey];
        }
    }
    return current;
}
