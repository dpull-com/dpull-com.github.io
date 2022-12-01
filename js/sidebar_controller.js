let sidebarList = document.getElementById("sidebarList");
let containerIFrame = document.getElementById("containerIFrame");

function fillSidebarList()
{
    let data = 
        {
            "Home" : 
            [
                {"text":"blog", "url":"https://blog.dpull.com"},
            ],
            "WebKit" : 
            [
                {"text":"lua demo", "url":"https://www.lua.org/demo.html"},
                {"text":"mermaid", "tip":"流程图编辑器", "url":"https://mermaid.live/"},
                {"text":"IEEE-754", "url":"https://babbage.cs.qc.cuny.edu/IEEE-754/"},
                {"text":"PathFinding", "tip":"2D寻路算法", "url":"https://qiao.github.io/PathFinding.js/visual/"},
                {"text":"gobang", "tip":"AI五子棋", "url":"http://gobang.light7.cn/#/"}
            ]
        }
    ;
    
    let html = new Array()

    for(var key in data)
    {
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
        for (var i in value)
        {
            let item = value[i]
            let tip = item.tip ?? item.text
            html.push(`<li><a href="#" onclick="containerNavTo('${item.url}')" title="${tip}" class="rounded">${item.text}</a></li>`)
        }
        html.push(end)
    }
 
    sidebarList.innerHTML = html.join('');
}

function containerNavTo(url)
{
    containerIFrame.src = url
}

fillSidebarList()