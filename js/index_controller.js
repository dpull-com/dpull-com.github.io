
let locationHashNav = new Array();
let defaultLocationHash;

function fillSidebarList1(html) {
    let data = {
        "Develop": [
            { "text": "Search", "url": "search.html" },
            { "text": "C Language", "tip": "C语言", "url": "https://en.cppreference.com/w/c" },
            { "text": "Cpp Insights", "url": "https://cppinsights.io" },
            { "text": "Lua Demo", "index": true, "url": "https://www.lua.org/demo.html" },
            { "text": "Regex Diagrams", "tip": "图形化正则表达式", "url": "https://regexper.com" },
            { "text": "Regex Test", "tip": "图形化正则表达式", "url": "https://myregextester.com" },
            { "text": "IEEE-754", "url": "https://babbage.cs.qc.cuny.edu/IEEE-754/" },
        ],
        "Flowchart / 流程图": [
            { "text": "Mermaid Editor", "url": "https://mermaid.live" },
            { "text": "Asciiflow", "url": "https://asciiflow.com" },
            { "text": "Code2flow", "url": "https://app.code2flow.com" },
        ],
        "GameDevelop": [
            { "text": "PathFinding", "tip": "2D寻路算法", "url": "https://qiao.github.io/PathFinding.js/visual/" },
            { "text": "Gobang / AI五子棋", "url": "http://gobang.light7.cn" },
        ],
        "Tools": [
            { "text": "Integer Sequences", "url": "https://oeis.org" },
            { "text": "encode and decode", "url": "https://emn178.github.io/online-tools/base64_decode.html" },
            { "text": "Markdown tables generator", "tip": "Markdown table编辑器", "url": "https://www.tablesgenerator.com/markdown_tables" },
            { "text": "Json Editor", "url": "https://jsoneditoronline.org" },
            { "text": "Explain Shell", "url": "https://explainshell.com" },
            { "text": "TLDR", "url": "https://tldr.finzzz.net" },
        ]
    };

    for (var key in data) {
        let start = `
          <li class="mb-1">
            <button
              class="btn btn-toggle align-items-center rounded"
              data-bs-toggle="collapse"
              data-bs-target="#c${key}-collapse"
              aria-expanded="true"
            >
            ${key}
            </button>
            <div class="collapse show" id="home-collapse">
              <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
        `
        let end = `
              </ul>
             </div>
           </li>
        `
        html.push(start)

        let value = data[key]
        for (var i in value) {
            let item = value[i]
            let tip = item.tip ?? item.text

            let locationHash = encodeURI(`#${item.text}`)
            locationHashNav[locationHash] = item.url
            if (item.index) {
                defaultLocationHash = locationHash
            } 
            html.push(`<li><a href="${locationHash}" title="${tip}" class="rounded">${item.text}</a></li>`)
        }
        html.push(end)
    }
}


function fillSidebarList2(html) {
    let data =
    {
        "Link":
            [
                { "text": "Blog", "url": "https://blog.dpull.com" },
                { "text": "Google Translate", "url": "https://translate.google.com/" },
            ]
    };

    html.push(`<li class="border-top my-3"></li>`)

    for (var key in data) {
        let start = `
          <li class="mb-1">
            <button
              class="btn btn-toggle align-items-center rounded"
              data-bs-toggle="collapse"
              data-bs-target="#c${key}-collapse"
              aria-expanded="true"
            >
            ${key}
            </button>
            <div class="collapse show" id="home-collapse">
              <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
        `
        let end = `
              </ul>
             </div>
           </li>
        `
        html.push(start)

        let value = data[key]
        for (var i in value) {
            let item = value[i]
            let tip = item.tip ?? item.text
            html.push(`<li><a href="${item.url}" title="${tip}" class="rounded">${item.text}</a></li>`)
        }
        html.push(end)
    }

}

function fillSidebarList() {
    let html = new Array()
    fillSidebarList1(html)
    fillSidebarList2(html)

    let sidebarList = document.getElementById("sidebarList");
    sidebarList.innerHTML = html.join('');
}

function containerNavTo() {
    let containerIFrame = document.getElementById("containerIFrame");
    let locationHash = window.location.hash;
    let url = locationHashNav[locationHash] ?? locationHashNav[defaultLocationHash];
    containerIFrame.src = url;
}

window.addEventListener("hashchange", containerNavTo, false);
fillSidebarList()
setTimeout(containerNavTo, 10)