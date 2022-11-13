/**
 * @param {string} sel
 * @return {Element[]} results
 */
const $$ = sel => Array.from(document.querySelectorAll(sel));

/**
 * @param {string} tag
 * @param {{[name: string]: string}} attrs
 * @param {Array<Element|string>|Element|string} children
 * @return {Element}
 */
const h = (tag, attrs, children=[]) => {
    const tagData = tag.match(/(^|[#.])[^#.]*/g) || [];
    const el = document.createElement(tagData.shift() || 'div');
    tagData.forEach(str =>
        str[0] === '.' ? el.classList.add(str.substr(1)) :
        str[0] === '#' ? el.setAttribute('id', str.substr(1)) : '');

    Object.keys(attrs).forEach(k => el.setAttribute(k, attrs[k]));

    const kids = children instanceof Array ? children : [ children ];

    kids.forEach(kid => (typeof kid === 'string')
        ? el.appendChild(document.createTextNode(kid))
        : el.appendChild(kid));

    return el;
};

const dictionary = fetch('./words-large.txt')
    .then(resp => resp.text())
    .then(txt => new Set(txt.toLowerCase().split('\n')));

/**
 *
 * @param {Element} el
 */
const removeColumn = (el) => {
    const column = el.closest('.column');
    if (!column) { return null; }
    column.remove();
};

const addColumn = () => {
    const domColumns = document.getElementById('columns');
    if (!domColumns) { return null; }

    domColumns.appendChild(h('li.column', {}, [
        h('input.inColumn', { type: 'text' }),
        h('button.btnRemove', {tabIndex: '-1'}, 'Remove')
    ]));
};

/**
 *
 * @param {Set<string>} words
 * @param {string[][]} columns
 * @param {string} prefix
 * @param {string[]} results
 * @return {string[]} the results
 */
const solve = (words, columns, prefix = '', results = []) => {
    if (columns.length === 0 && words.has(prefix)) {
        results.push(prefix);
    } else if (columns.length > 0) {
        const newColumns = columns.slice(1);
        for(const char of columns[0]) {
            solve(words, newColumns, prefix + char, results);
        }
    }
    return results;
};

document.addEventListener('click', async ev => {
    const target = /** @type {Element} */(ev.target);
    const domAdd = target.closest('.btnAdd');
    const domRemove = target.closest('.btnRemove');
    const domSolve = target.closest('.btnSolve');
    const domResult = document.querySelector('.result');

    if (domAdd) { addColumn(); }

    if (domRemove) { removeColumn(domRemove); }

    if (domSolve && domResult) {
        const domCols = /** @type {HTMLInputElement[]} */($$('.inColumn'));
        const cols = domCols.map(col => col.value.toLowerCase().split(''));
        const words = await dictionary;
        const results = solve(words, cols);
        domResult.innerHTML = results.join(', ');
    }
});