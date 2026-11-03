(function(g) {
    "use strict";
    function cents(text) {
        var s=String(text||"").trim();
        if(!s)return null;
        s=s.includes(",")?s.replace(/\./g,
        "").replace(",",
        "."):s;
        if(!/^\d+(?:\.\d{1,2})?$/.test(s))return null;
        var p=s.split("."),
        whole=Number(p[0]),
        frac=p.length>1?Number((p[1]+"00").slice(0,
        2)):0;
        if(!Number.isSafeInteger(whole))return null;
        var n=whole*100+frac;
        return Number.isSafeInteger(n)?n:null;
    }
    function pct(text) {
        var s=String(text||"").trim();
        if(!/^-?\d+(?:[.,]\d+)?$/.test(s))return null;
        var n=Number(s.replace(",",
        "."));
        return Number.isFinite(n)?n/100:null;
    }
    function money(n) {
        return new Intl.NumberFormat("pt-BR",
        {
            style:"currency",
            currency:"BRL",
            minimumFractionDigits:2,
            maximumFractionDigits:2
        }
        ).format(n);
    }
    function validate(r) {
        var e=[];
        function err(fields,
        message) {
            e.push( {
                fields:fields,
                message:message
            }
            );
        }
        function m(id,
        label) {
            var n=cents(r[id]);
            if(n===null)err([id],
            "Informe um valor válido para "+label+", igual ou maior que zero, com até duas casas decimais.");
            return n;
        }
        function p(id,
        label,
        min,
        max,
        msg) {
            var n=pct(r[id]);
            if(n===null) {
                err([id],
                "Informe uma porcentagem válida para "+label+".");
                return null;
            }
            if(min!==null&&n<min||max!==null&&n>max) {
                err([id],
                msg);
                return null;
            }
            return n;
        }
        var capital=m("capital",
        "o capital inicial"),
        it=m("initial-tesouro",
        "a alocação ao Tesouro"),
        ifii=m("initial-fii",
        "a alocação a FII"),
        mt=m("monthly-tesouro",
        "o aporte ao Tesouro"),
        mf=m("monthly-fii",
        "o aporte a FII"),
        price=m("share-price",
        "o preço da cota");
        var appreciation=p("appreciation",
        "a valorização",
        -1,
        null,
        "Use uma taxa igual ou maior que -100% ao ano."),
        dy=p("dy",
        "o Dividend Yield",
        0,
        null,
        "O Dividend Yield deve ser igual ou maior que zero."),
        reinvest=p("reinvest",
        "o reinvestimento",
        0,
        1,
        "Informe um percentual entre 0% e 100%."),
        inflation=p("inflation",
        "a inflação",
        -1,
        null,
        "Use uma taxa igual ou maior que -100% ao ano."),
        real=p("real-rate",
        "a taxa real",
        -1,
        null,
        "Use uma taxa igual ou maior que -100% ao ano.");
        var ms=String(r.months||"").trim(),
        months=null;
        if(!/^\d+$/.test(ms)||Number(ms)<1||Number(ms)>120) {
            err(["months"],
            "Informe um número inteiro de 1 a 120 meses.");
        }
        else months=Number(ms);
        var start=/^(\d{4})-(\d{2})$/.exec(r.start||"");
        if(!start||Number(start[1])<1||Number(start[2])<1||Number(start[2])>12)err(["start"],
        "Informe um mês e ano válidos.");
        var year=start?Number(start[1]):null,
        month=start?Number(start[2]):null;
        if(capital!==null&&it!==null&&ifii!==null) {
            var allocation=it+ifii;
            if(!Number.isSafeInteger(allocation)) {
                err(["initial-tesouro",
                "initial-fii"],
                "A soma das alocações excede o limite seguro de valores inteiros.");
            }
            else if(allocation!==capital) {
                var diff=capital-allocation;
                err(["initial-tesouro",
                "initial-fii"],
                diff>0?"Falta distribuir "+money(diff/100)+".":"As alocações excedem o capital em "+money(-diff/100)+".");
            }
        }
        if(price===0)err(["share-price"],
        "O preço inicial da cota deve ser maior que zero.");
        if(e.length)return {
            ok:false,
            errors:e
        }
        ;
        return {
            ok:true,
            errors:[],
            values: {
                capital:capital,
                initialTreasury:it,
                initialFii:ifii,
                monthlyTreasury:mt,
                monthlyFii:mf,
                price:price,
                appreciation:appreciation,
                dy:dy,
                reinvest:reinvest,
                inflation:inflation,
                real:real,
                months:months,
                year:year,
                month:month
            }
        }
        ;
    }
    function safe(n) {
        if(!Number.isFinite(n)||n<0||n>Number.MAX_SAFE_INTEGER/100)throw Error("numeric");
        return n;
    }
    function buy(cash,
    price) {
        if(!(price>0))throw Error("numeric");
        var q=cash/price;
        if(!Number.isFinite(q)||q>Number.MAX_SAFE_INTEGER)throw Error("numeric");
        var count=Math.floor(q+Number.EPSILON*Math.max(1,
        Math.abs(q))*2),
        left=cash-count*price,
        tol=Number.EPSILON*Math.max(1,
        Math.abs(cash),
        Math.abs(count*price))*4;
        if(left<0&&left>=-tol)left=0;
        if(left<0)throw Error("numeric");
        return {
            count:count,
            left:safe(left)
        }
        ;
    }
    function project(p) {
        var fiiRate=Math.pow(1+p.appreciation,
        1/12)-1,
        nominal=(1+p.inflation)*(1+p.real)-1,
        treasuryRate=Math.pow(1+nominal,
        1/12)-1;
        if(![fiiRate,
        nominal,
        treasuryRate].every(Number.isFinite))throw Error("numeric");
        var price=p.price/100,
        treasury=p.initialTreasury/100,
        first=buy(p.initialFii/100,
        price),
        shares=first.count,
        eligible=first.left,
        retained=0,
        own=p.capital/100,
        rows=[];
        function add(i) {
            var value=safe(shares*price),
            cash=safe(eligible+retained),
            total=safe(treasury+value+cash),
            idx=p.year*12+p.month-1+i,
            y=Math.floor(idx/12),
            m=idx%12+1;
            rows.push( {
                month:i,
                ref:String(m).padStart(2,
                "0")+"/"+y,
                own:own,
                treasury:treasury,
                shares:shares,
                price:price,
                value:value,
                eligible:eligible,
                retained:retained,
                cash:cash,
                total:total
            }
            );
        }
        add(0);
        for(var i=1;
        i<=p.months;
        i++) {
            var oldPrice=price,
            oldShares=shares;
            price=safe(price*(1+fiiRate));
            if(!(price>0))throw Error("numeric");
            treasury=safe(treasury*(1+treasuryRate));
            var distribution=safe(oldShares*oldPrice*p.dy/12);
            treasury=safe(treasury+p.monthlyTreasury/100);
            eligible=safe(eligible+p.monthlyFii/100+distribution*p.reinvest);
            retained=safe(retained+distribution*(1-p.reinvest));
            var bought=buy(eligible,
            price);
            shares+=bought.count;
            if(!Number.isSafeInteger(shares))throw Error("numeric");
            eligible=bought.left;
            own=safe(own+(p.monthlyTreasury+p.monthlyFii)/100);
            add(i);
        }
        return {
            rows:rows,
            rates: {
                nominal:nominal
            }
        }
        ;
    }
    function magic(row,
    p) {
        var base=safe(row.shares*row.price),
        income=safe(base*p.dy/12),
        target=p.price/100,
        progress=Math.min(100,
        income/target*100),
        remaining=Math.max(0,
        target-income);
        if(![progress,
        remaining].every(Number.isFinite))throw Error("numeric");
        return {
            base:base,
            income:income,
            target:target,
            progress:progress,
            remaining:remaining
        }
        ;
    }
    g.Calculos= {
        cents:cents,
        pct:pct,
        money:money,
        validate:validate,
        project:project,
        magic:magic
    }
    ;
}
)(window);
