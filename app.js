(function() {
    "use strict";
    var $=function(id) {
        return document.getElementById(id);
    },
    fmt=Calculos.money,
    num=new Intl.NumberFormat("pt-BR",
    {
        maximumFractionDigits:4
    }
    ),
    integer=new Intl.NumberFormat("pt-BR",
    {
        maximumFractionDigits:0
    }
    );
    var series=[["own",
    "Recursos próprios",
    "#1D4ED8",
    ""],
    ["treasury",
    "Tesouro IPCA+",
    "#6D28D9",
    "12 6"],
    ["value",
    "Valor das cotas FII",
    "#0F766E",
    "3 5"],
    ["eligible",
    "Caixa elegível",
    "#0369A1",
    "12 4 3 4"],
    ["retained",
    "Caixa retido",
    "#B45309",
    "2 7"],
    ["cash",
    "Caixa FII total",
    "#4B5563",
    "10 5"],
    ["total",
    "Patrimônio total",
    "#172554",
    ""]];
    var types= {
        aporte:"Aporte",
        compra:"Compra",
        rendimento:"Rendimento recebido",
        "custo-imposto":"Custo/imposto efetivamente pago"
    },
    mods= {
        tesouro:"Tesouro IPCA+",
        fii:"FII"
    },
    key="tcc-ma:registros:v1",
    latest=false,
    moves=[],
    observations=[],
    unsaved=new Set(),
    storeState="available",
    badStore=false,
    errors=[],
    recordErrors= {
        movement:[],
        observation:[]
    }
    ;
    function inputs() {
        var o= {
        }
        ;
        ["start",
        "months",
        "capital",
        "initial-tesouro",
        "initial-fii",
        "monthly-tesouro",
        "monthly-fii",
        "appreciation",
        "dy",
        "share-price",
        "reinvest",
        "inflation",
        "real-rate"].forEach(function(id) {
            o[id]=$(id).value;
        }
        );
        return o;
    }
    function clearErrors(form) {
        form.querySelectorAll(".field-error").forEach(function(n) {
            n.textContent="";
        }
        );
        form.querySelectorAll("input,select").forEach(function(n) {
            n.removeAttribute("aria-invalid");
        }
        );
    }
    function errorSlot(form,
    id) {
        var slots=form.querySelectorAll(".field-error");
        for(var i=0;
        i<slots.length;
        i++) {
            if(slots[i].getAttribute("data-error-for")===id)return slots[i];
        }
        return null;
    }
    function showErrors(form,
    summary,
    list,
    title) {
        clearErrors(form);
        summary.replaceChildren();
        summary.hidden=!list.length;
        if(!list.length)return;
        var h=document.createElement("h3"),
        p=document.createElement("p"),
        ul=document.createElement("ul");
        h.textContent=title||"Revise os campos indicados";
        p.textContent="Há "+list.length+" problema(s) que precisam de correção.";
        list.forEach(function(e) {
            var target=e.fields[0];
            e.fields.forEach(function(id) {
                var input=$(id),
                slot=errorSlot(form,
                id);
                if(input)input.setAttribute("aria-invalid",
                "true");
                if(slot)slot.textContent=e.message;
            }
            );
            var li=document.createElement("li"),
            a=document.createElement("a");
            a.href="#"+target;
            a.textContent=e.message;
            li.appendChild(a);
            ul.appendChild(li);
        }
        );
        summary.append(h,
        p,
        ul);
    }
    function totals() {
        var a=Calculos.cents($("monthly-tesouro").value),
        b=Calculos.cents($("monthly-fii").value);
        $("monthly-total").textContent=a===null||b===null? "Informe aportes válidos":fmt((a+b)/100);
        var c=Calculos.cents($("capital").value),
        x=Calculos.cents($("initial-tesouro").value),
        y=Calculos.cents($("initial-fii").value);
        $("allocation").textContent=c===null||x===null||y===null?"Informe o capital e as duas alocações para conferir a soma.":x+y===c?"Alocações somadas: "+fmt(c/100)+".":x+y<c?"Falta distribuir "+fmt((c-x-y)/100)+".":"As alocações excedem o capital em "+fmt((x+y-c)/100)+".";
    }
    function stale() {
        if(latest) {
            $("projection-status").textContent="Desatualizada — as entradas mudaram. Gere novamente para atualizar.";
            $("stale").hidden=false;
        }
        else {
            $("projection-status").textContent=Calculos.validate(inputs()).ok?"Entradas válidas. Gere a projeção para atualizar os resultados.":"Preencha as premissas e gere uma projeção para consultar os resultados.";
            $("stale").hidden=true;
        }
    }
    function changed(e) {
        var id=e.target.id;
        if(errors.length) {
            var current=Calculos.validate(inputs());
            errors=current.errors||[];
        }
        else {
            errors=errors.map(function(x) {
                return {
                    fields:x.fields.filter(function(f) {
                        return f!==id;
                    }),
                    message:x.message
                };
            }).filter(function(x) {
                return x.fields.length;
            });
        }
        showErrors($("sim-form"),$("sim-errors"),errors,"Revise as premissas");
        totals();
        stale();
        renderRecords("movement");
        renderRecords("observation");
    }
    $("sim-form").addEventListener("input",
    changed);
    $("sim-form").addEventListener("change",
    changed);
    function svg(tag,
    attrs) {
        var n=document.createElementNS("http://www.w3.org/2000/svg",
        tag);
        Object.keys(attrs).forEach(function(k) {
            n.setAttribute(k,
            attrs[k]);
        }
        );
        return n;
    }
    function chart(rows) {
        var s=$("chart"),
        legend=$("legend"),
        W=1000,
        H=440,
        L=100,
        R=24,
        T=24,
        B=54,
        pw=W-L-R,
        ph=H-T-B,
        vals=[];
        rows.forEach(function(r) {
            series.forEach(function(x) {
                vals.push(r[x[0]]);
            }
            );
        }
        );
        var max=Math.max.apply(null,
        vals.concat([0]))||1,
        axis=max*1.08,
        els=[];
        s.querySelectorAll(".dynamic").forEach(function(n) {
            n.remove();
        }
        );
        for(var i=0;
        i<=4;
        i++) {
            var y=T+ph*(1-i/4),
            line=svg("line",
            {
                x1:L,
                y1:y,
                x2:W-R,
                y2:y,
                class:"chart-grid-line dynamic"
            }
            ),
            txt=svg("text",
            {
                x:L-8,
                y:y+5,
                "text-anchor":"end",
                class:"chart-label dynamic"
            }
            );
            txt.textContent=fmt(axis*i/4);
            els.push(line,
            txt);
        }
        els.push(svg("line",
        {
            x1:L,
            y1:T,
            x2:L,
            y2:T+ph,
            class:"chart-axis dynamic"
        }
        ),
        svg("line",
        {
            x1:L,
            y1:T+ph,
            x2:W-R,
            y2:T+ph,
            class:"chart-axis dynamic"
        }
        ));
        var x0=svg("text",
        {
            x:L,
            y:H-12,
            class:"chart-label dynamic"
        }
        ),
        xn=svg("text",
        {
            x:W-R,
            y:H-12,
            "text-anchor":"end",
            class:"chart-label dynamic"
        }
        );
        x0.textContent="Mês 0";
        xn.textContent="Mês "+rows[rows.length-1].month;
        els.push(x0,
        xn);
        series.forEach(function(x) {
            var d=rows.map(function(r,
            j) {
                return(j?"L":"M")+(L+j*pw/(rows.length-1)).toFixed(2)+" "+(T+ph-r[x[0]]/axis*ph).toFixed(2);
            }
            ).join(" ");
            els.push(svg("path",
            {
                d:d,
                class:"chart-series dynamic"+(x[0]==="total"?" total-line":""),
                stroke:x[2],
                "stroke-dasharray":x[3],
                "aria-hidden":"true"
            }
            ));
        }
        );
        s.append.apply(s,
        els);
        legend.replaceChildren();
        series.forEach(function(x) {
            var li=document.createElement("li"),
            sw=document.createElement("span"),
            label=document.createElement("span");
            sw.className="swatch "+(x[3]?"dashed":"")+(x[0]==="total"?" double":"");
            sw.style.color=x[2];
            sw.setAttribute("aria-hidden",
            "true");
            label.textContent=x[1];
            li.append(sw,
            label);
            legend.appendChild(li);
        }
        );
    }
    function table(rows) {
        var body=$("rows");
        body.replaceChildren();
        rows.forEach(function(r) {
            var tr=document.createElement("tr"),
            vals=["Mês "+r.month+" — "+r.ref,
            fmt(r.own),
            fmt(r.treasury),
            integer.format(r.shares),
            fmt(r.price),
            fmt(r.value),
            fmt(r.eligible),
            fmt(r.retained),
            fmt(r.cash),
            fmt(r.total)];
            vals.forEach(function(v,
            i) {
                var td=document.createElement(i?"td":"th");
                if(!i)td.scope="row";
                td.textContent=v;
                tr.appendChild(td);
            }
            );
            body.appendChild(tr);
        }
        );
    }
    function assumptions(p,
    rates) {
        var dl=$("assumptions");
        dl.replaceChildren();
        var items=[["Capital inicial",
        fmt(p.capital/100)],
        ["Alocação Tesouro",
        fmt(p.initialTreasury/100)],
        ["Alocação FII",
        fmt(p.initialFii/100)],
        ["Aporte Tesouro",
        fmt(p.monthlyTreasury/100)],
        ["Aporte FII",
        fmt(p.monthlyFii/100)],
        ["Início e duração",
        String(p.month).padStart(2,
        "0")+"/"+p.year+" · "+p.months+" meses"],
        ["Valorização FII",
        num.format(p.appreciation*100)+"%"],
        ["Dividend Yield",
        num.format(p.dy*100)+"%"],
        ["Reinvestimento",
        num.format(p.reinvest*100)+"%"],
        ["Inflação",
        num.format(p.inflation*100)+"%"],
        ["Taxa real",
        num.format(p.real*100)+"%"],
        ["Taxa nominal Tesouro",
        num.format(rates.nominal*100)+"%"]];
        items.forEach(function(x) {
            var div=document.createElement("div"),
            dt=document.createElement("dt"),
            dd=document.createElement("dd");
            dt.textContent=x[0];
            dd.textContent=x[1];
            div.append(dt,
            dd);
            dl.appendChild(div);
        }
        );
    }
    function renderMagic(m) {
        var box=$("magic");
        box.replaceChildren();
        var grid=document.createElement("div");
        grid.className="magic-grid";
        [["Renda mensal projetada",
        fmt(m.income)],
        ["Alvo: preço inicial da cota",
        fmt(m.target)],
        ["Diferença de renda mensal",
        fmt(m.remaining)]].forEach(function(x) {
            var d=document.createElement("div"),
            b=document.createElement("strong"),
            t=document.createElement("span");
            b.textContent=x[1];
            t.textContent=x[0];
            d.append(b,
            t);
            grid.appendChild(d);
        }
        );
        var label=document.createElement("p"),
        bar=document.createElement("progress");
        label.textContent="Progresso da meta: "+num.format(m.progress)+"% (mínimo 0%, máximo 100%)";
        bar.max=100;
        bar.value=m.progress;
        bar.setAttribute("aria-label",
        "Progresso da renda mensal projetada em relação ao preço de uma cota");
        var method=document.createElement("p");
        method.className="method";
        method.textContent="Base = cotas inteiras finais × preço projetado final; renda = base × Dividend Yield anual ÷ 12. Caixa elegível, caixa retido e Tesouro ficam fora. A diferença é de renda mensal, não de capital a investir. Aproximação pedagógica; não prevê distribuição futura nem recomenda consumir patrimônio.";
        var milestone=document.createElement("p");
        milestone.textContent=m.progress>=100?"Marco de uma cota atingido nesta projeção.":"A meta ainda não foi atingida nesta projeção.";
        box.append(grid,
        label,
        bar,
        method,
        milestone);
    }
    $("sim-form").addEventListener("submit",
    function(e) {
        e.preventDefault();
        var v=Calculos.validate(inputs());
        errors=v.errors||[];
        showErrors($("sim-form"),
        $("sim-errors"),
        errors,
        "Revise as premissas");
        if(!v.ok) {
            $("sim-errors").focus();
            return;
        }
        try {
            var result=Calculos.project(v.values),
            last=result.rows[result.rows.length-1],
            m=Calculos.magic(last,
            v.values);
            $("own").textContent=fmt(last.own);
            $("total").textContent=fmt(last.total);
            $("treasury").textContent=fmt(last.treasury);
            $("share-value").textContent=fmt(last.value);
            $("share-count").textContent=integer.format(last.shares)+" cotas projetadas";
            $("eligible").textContent=fmt(last.eligible);
            $("retained").textContent=fmt(last.retained);
            $("cash").textContent=fmt(last.cash);
            chart(result.rows);
            table(result.rows);
            renderMagic(m);
            assumptions(v.values,
            result.rates);
            $("results").hidden=false;
            $("projection-status").textContent="Atualizada com as premissas atuais. Mês 0: "+result.rows[0].ref+"; fechamento: "+last.ref+".";
            $("stale").hidden=true;
            latest=true;
        }
        catch(err) {
            $("projection-status").textContent="Não foi possível calcular esta projeção com essas premissas. Revise as taxas e os valores.";
        }
    }
    );
    function civil(date) {
        if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
        var d=new Date(date+"T00:00:00Z");
        return Number.isFinite(d.getTime())&&d.toISOString().slice(0,
        10)===date;
    }
    function quantity(text) {
        var s=String(text||"").trim();
        if(!s)return {
            empty:true
        }
        ;
        if(!/^\d+(?:[.,]\d+)?$/.test(s))return {
            bad:true
        }
        ;
        var n=Number(s.replace(",",
        "."));
        return Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER? {
            value:n
        }
        : {
            bad:true
        }
        ;
    }
    function moduleLabel(x) {
        return mods[x];
    }
    function recordValid(r,
    kind) {
        if(!r||typeof r!=="object"||Array.isArray(r))return false;
        var keys=["id",
        "date",
        "module",
        "valueCents",
        "asset",
        "quantity"];
        if(kind==="movement")keys.push("type");
        if(Object.keys(r).some(function(k) {
            return keys.indexOf(k)<0;
        }
        ))return false;
        return typeof r.id==="string"&&!!r.id&&civil(r.date)&&!!mods[r.module]&&Number.isSafeInteger(r.valueCents)&&r.valueCents>=0&&(kind!=="movement"||!!types[r.type])&&(!("asset"in r)||typeof r.asset==="string")&&(!("quantity"in r)||(typeof r.quantity==="number"&&Number.isFinite(r.quantity)&&r.quantity>=0));
    }
    function load() {
        var text;
        try {
            text=localStorage.getItem(key);
        }
        catch(e) {
            storeState="unavailable";
            return;
        }
        if(text===null)return;
        var d;
        try {
            d=JSON.parse(text);
        }
        catch(e) {
            badStore=true;
            storeState="incompatible";
            return;
        }
        if(!d||d.schemaVersion!==1||!Array.isArray(d.movements)||!Array.isArray(d.observations)||!d.movements.every(function(r) {
            return recordValid(r,
            "movement");
        }
        )||!d.observations.every(function(r) {
            return recordValid(r,
            "observation");
        }
        )) {
            badStore=true;
            storeState="incompatible";
            return;
        }
        moves=d.movements;
        observations=d.observations;
    }
    function status() {
        $("storage").textContent=storeState==="incompatible"?"Os registros existentes não puderam ser lidos e não foram alterados. Novos registros podem não ser persistidos.":storeState==="unavailable"?"Armazenamento indisponível; registros desta sessão não têm persistência garantida.":storeState==="failed"?"Falha ao salvar. Itens não persistidos ficam visíveis somente nesta sessão.":"Armazenamento local neste navegador; sem sincronização ou backup.";
    }
    function serialize(r,
    kind) {
        var x= {
            id:r.id,
            date:r.date,
            module:r.module,
            valueCents:r.valueCents
        }
        ;
        if(kind==="movement")x.type=r.type;
        if(r.asset)x.asset=r.asset;
        if(r.quantity!==undefined)x.quantity=r.quantity;
        return x;
    }
    function persist() {
        if(badStore||storeState==="unavailable")return false;
        try {
            localStorage.setItem(key,
            JSON.stringify( {
                schemaVersion:1,
                movements:moves.map(function(r) {
                    return serialize(r,
                    "movement");
                }
                ),
                observations:observations.map(function(r) {
                    return serialize(r,
                    "observation");
                }
                )
            }
            ));
            storeState="available";
            unsaved.clear();
            status();
            return true;
        }
        catch(e) {
            storeState="failed";
            status();
            return false;
        }
    }
    function periodLabel(date) {
        var start=/^(\d{4})-(\d{2})$/.exec($("start").value),
        n=Number($("months").value);
        if(!start||!Number.isInteger(n)||n<1||n>120)return"Período da projeção ainda não definido.";
        var d=date.split("-").map(Number),
        a=Number(start[1])*12+Number(start[2])-1,
        b=d[0]*12+d[1]-1;
        return b>=a&&b<=a+n?"Dentro do período desta projeção.":"Fora do período desta projeção.";
    }
    function renderRecords(kind) {
        var mv=kind==="movement",
        list=$(kind+"-list"),
        empty=$(kind+"-empty"),
        data=mv?moves:observations;
        list.replaceChildren();
        empty.hidden=data.length>0;
        if(!data.length&&badStore)empty.textContent="Não foi possível confirmar o conteúdo salvo anteriormente.";
        data.slice().sort(function(a,
        b) {
            return b.date.localeCompare(a.date);
        }
        ).forEach(function(r) {
            var li=document.createElement("li"),
            title=document.createElement("strong");
            li.className="record";
            title.textContent=mv?r.date+" — "+types[r.type]:r.date+" — Observação patrimonial";
            li.appendChild(title);
            function line(label,
            value) {
                if(value===undefined||value==="")return;
                var p=document.createElement("p");
                p.textContent=label+": "+value;
                li.appendChild(p);
            }
            line("Módulo",
            moduleLabel(r.module));
            line(mv?"Valor efetivo":"Valor observado",
            fmt(r.valueCents/100));
            line("Ativo/título/FII",
            r.asset);
            line("Quantidade",
            r.quantity===undefined?undefined:num.format(r.quantity));
            line("Período",
            periodLabel(r.date));
            if(unsaved.has(r.id)) {
                var p=document.createElement("p");
                p.className="pending";
                p.textContent="Registro desta sessão; ainda não persistido.";
                li.appendChild(p);
            }
            list.appendChild(li);
        }
        );
    }
    function validateRecord(kind) {
        var e=[],
        dateId=kind+"-date",
        moduleId=kind+"-module",
        valueId=kind+"-value",
        date=$(dateId).value,
        module=$(moduleId).value,
        cents=Calculos.cents($(valueId).value),
        type=kind==="movement"?$("movement-type").value:null,
        q=quantity($(kind+"-quantity").value);
        function add(id,
        msg) {
            e.push( {
                fields:[id],
                message:msg
            }
            );
        }
        if(!civil(date))add(dateId,
        "Informe uma data civil válida.");
        if(!mods[module])add(moduleId,
        "Selecione o módulo.");
        if(cents===null)add(valueId,
        "Informe um valor válido, igual ou maior que zero, com até duas casas decimais.");
        if(kind==="movement"&&!types[type])add("movement-type",
        "Selecione o tipo de movimento.");
        if(q.bad)add(kind+"-quantity",
        "Informe uma quantidade válida ou deixe o campo vazio.");
        return {
            errors:e,
            record: {
                id:"",
                date:date,
                module:module,
                type:type,
                valueCents:cents,
                asset:$(kind+"-asset").value.trim(),
                quantity:q.value
            }
        }
        ;
    }
    function submitRecord(e,
    kind) {
        e.preventDefault();
        var form=$(kind+"-form"),
        summary=$(kind+"-errors"),
        statusNode=$(kind+"-status"),
        v=validateRecord(kind);
        recordErrors[kind]=v.errors;
        showErrors(form,
        summary,
        recordErrors[kind],
        "Revise os campos indicados");
        statusNode.textContent="";
        if(v.errors.length) {
            summary.focus();
            return;
        }
        var data=kind==="movement"?moves:observations,
        r=v.record,
        pending=form.dataset.pending||"";
        if(pending) {
            r.id=pending;
            var i=data.findIndex(function(x) {
                return x.id===pending;
            }
            );
            if(i>=0)data[i]=r;
            else {
                r.id="local-"+Date.now()+"-"+Math.random();
                data.push(r);
            }
        }
        else {
            r.id=window.crypto&&crypto.randomUUID?crypto.randomUUID():"local-"+Date.now()+"-"+Math.random();
            data.push(r);
        }
        form.dataset.pending=r.id;
        var saved=persist();
        if(saved) {
            statusNode.textContent="Registro salvo neste navegador.";
            form.reset();
            form.dataset.pending="";
            recordErrors[kind]=[];
            showErrors(form,
            summary,
            recordErrors[kind],
            "Revise os campos indicados");
            clearErrors(form);
        }
        else {
            unsaved.add(r.id);
            statusNode.textContent="Não foi possível salvar neste navegador. O registro continua visível nesta sessão e pode ser perdido ao fechar ou recarregar. Campos preservados para nova tentativa.";
            status();
        }
        renderRecords(kind);
    }
    function toggle(button,
    form,
    first) {
        $(button).addEventListener("click",
        function() {
            var f=$(form),
            opening=f.hidden;
            f.hidden=!opening;
            $(button).setAttribute("aria-expanded",
            opening?"true":"false");
            if(opening)$(first).focus();
        }
        );
    }
    ["movement",
    "observation"].forEach(function(k) {
        var form=$(k+"-form");
        form.addEventListener("submit",
        function(e) {
            submitRecord(e,
            k);
        }
        );
        function clearRecordField(e) {
            var id=e.target.id;
            if(!id)return;
            recordErrors[k]=recordErrors[k].map(function(x) {
                return {
                    fields:x.fields.filter(function(f) {
                        return f!==id;
                    }
                    ),
                    message:x.message
                }
                ;
            }
            ).filter(function(x) {
                return x.fields.length;
            }
            );
            showErrors(form,
            $(k+"-errors"),
            recordErrors[k],
            "Revise os campos indicados");
        }
        form.addEventListener("input",
        clearRecordField);
        form.addEventListener("change",
        clearRecordField);
    }
    );
    toggle("show-movement",
    "movement-form",
    "movement-date");
    toggle("show-observation",
    "observation-form",
    "observation-date");
    load();
    status();
    totals();
    renderRecords("movement");
    renderRecords("observation");
}
)();
