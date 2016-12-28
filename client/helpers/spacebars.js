UI.registerHelper('pluralize', function (n, thing) {
    if (n === 1 || n === 0) {
        return n + ' ' + thing;
    } else {
        return n + ' ' + thing + 's';
    }
});