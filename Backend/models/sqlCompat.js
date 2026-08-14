function createSingleResult(loader) {
    const promise = Promise.resolve().then(loader);

    return Object.assign(promise, {
        select() {
            return this;
        },
        populate() {
            return this;
        },
        lean: async () => {
            return promise;
        },
        exec: async () => {
            return promise;
        },
    });
}

function createFindBuilder(loader) {
    return {
        select() {
            return this;
        },
        populate() {
            return this;
        },
        sort() {
            return this;
        },
        skip() {
            return this;
        },
        limit() {
            return this;
        },
        lean: async () => loader(),
        exec: async () => loader(),
    };
}

function wrapDocument(document, Model = null) {
    if (!document) return null;

    const target = Model && typeof Model === "function" && !(document instanceof Model)
        ? new Model(document)
        : document;

    const nativeSave = typeof target.save === "function" ? target.save.bind(target) : null;

    const save = async function save() {
        if (nativeSave) {
            return nativeSave();
        }
        return target;
    };

    return Object.assign(target, {
        lean: async () => ({ ...target }),
        toObject: function () {
            return { ...this };
        },
        save,
        select() {
            return this;
        },
        populate() {
            return this;
        },
        exec: async () => target,
    });
}

module.exports = {
    createSingleResult,
    createFindBuilder,
    wrapDocument,
};
