window.addEventListener('load', () => {
    const searchBtn = document.getElementById('commit');
    const disFilterWrapper = document.getElementById('dis-filter-wrapper');
    const input = document.getElementById('searchBox');

    const form = document.querySelector('#searchForm');
    const filter = document.getElementById('filter');

    filter.addEventListener('change', e => {
        const value = e.target.value;
        if (value === 'street') {
            disFilterWrapper.setAttribute('style', 'display: flex;');
            input.removeAttribute('disabled');
            input.value = '';
        }
        else {
            disFilterWrapper.setAttribute('style', 'display: none;');
            input.setAttribute('disabled', 'true');
            input.value = 'Parking Structure - LAX';
        }
    });

    form.addEventListener('submit', event => {
        event.preventDefault(); // 防止表单提交

        const filter = document.getElementById('filter').value;

        if (filter === 'street') {
            var origin = document.getElementById('searchBox').value;
            var walkingDis = document.getElementById('dis-filter').value;
            getSearchResult(origin, walkingDis);
        }
        else {
            // TODO: Parking Structure here
            getStructureResult();
        }
    });
});

function getSearchResult(origin, walkingDis) {
    addLoading();
    axios
        .post('http://localhost:3000/searchBlockSpace', {origin, walkingDis})
        .then((res) => {
            console.log(res);
            resolveResult(res.data.blockSpaces, 'street');
        })
        .finally(() => removeLoading());
}

function getStructureResult() {
    addLoading();
    axios
        .get('https://data.lacity.org/resource/dik5-hwp6.json')
        .then(res => {
            console.log(res);
            const normalized = res.data.sort((a, b) => {
                return (+b.freespaces) - (+a.freespaces);
            }).map(item => {
                return {
                    name: item.parkingname,
                    distance: +item.freespaces
                }
            });
            console.log(normalized);

            resolveResult(normalized, 'structure');
        })
        .finally(() => removeLoading());
}

function resolveResult(blockSpaces, type) {
    const resultEle = document.getElementById('result');

    if (!blockSpaces.length) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        // TODO: 选一个合适的文案
        empty.innerHTML = 'Sorry! No Parking Spaces Avaiable Near Your Destination.';

        resultEle.replaceChildren(empty);

        return;
    }

    const nodes = blockSpaces.map(item => {
        const node = document.createElement('div');
        const name = document.createElement('div');
        const dis = document.createElement('div');

        node.className = 'resultItem';
        name.innerHTML = item.name;
        name.className = 'tableItem';
        dis.innerHTML = item.distance;
        dis.className = 'tableItem';

        node.append(name, dis);

        if (item.rateRange) {
            const ele = document.createElement('div');
            ele.innerHTML = item.rateRange;
            ele.className = 'tableItem';
            node.append(ele);
        }

        if (item.timeLimit) {
            const ele = document.createElement('div');
            ele.innerHTML = item.timeLimit;
            ele.className = 'tableItem';
            node.append(ele);
        }

        return node;
    });

    const title = document.createElement('div');
    title.className = 'tableTitle resultItem';

    if (type === 'street') {
        const ele1 = document.createElement('div');
        const ele2 = document.createElement('div');
        const ele3 = document.createElement('div');
        const ele4 = document.createElement('div');
        ele1.innerHTML = 'Block Face Location';
        ele1.className = 'tableItem';
        ele2.innerHTML = 'Distance to Destination';
        ele2.className = 'tableItem';
        ele3.innerHTML = 'Rate Range';
        ele3.className = 'tableItem';
        ele4.innerHTML = 'Parking Time Limit';
        ele4.className = 'tableItem';
        title.append(ele1, ele2, ele3, ele4);
    }
    else {
        const ele1 = document.createElement('div');
        const ele2 = document.createElement('div');
        ele1.innerHTML = 'Parking Lot';
        ele2.innerHTML = 'Spaces Left';

        ele1.className = 'tableItem';
        ele2.className = 'tableItem';
        title.append(ele1, ele2);
    }

    resultEle.replaceChildren(title, ...nodes);
}

function addLoading() {
    const searchBtn = document.getElementById('searchBtnText');
    searchBtn.className = 'loading';
}

function removeLoading() {
    const searchBtn = document.getElementById('searchBtnText');
    searchBtn.className = '';
}
