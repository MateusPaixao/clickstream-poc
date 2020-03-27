const normalizeFPS = callback => {
    let ticking = true
    const update = () => {
        if (ticking) requestAnimationFrame(update)
        ticking = true
    }
    return event => {
        if (ticking) {
            callback(event)
            update()
        }
        ticking = false
    }
}

const trackCLickStream = () => {
    const data = []

    const pushEventData = ({ pageX, pageY, type}) => {
        
        data.push({
            time: Date.now(),
            x: pageX,
            y: pageY,
            type
        })
    }

    document.addEventListener('mousemove', normalizeFPS(pushEventData))
    document.addEventListener('click', pushEventData)

    return data
}

const paintLive = (data, max = 5) => {
    const heatmap = h337.create({
        container: document.documentElement
    })

    const update = () => {
        heatmap.setData({
            max,
            data
        })
    }

    setInterval(() => {
        update(data)
    }, 10)
    
}

const paintHeatMap = (data, max) => {
    const heatmap = h337.create({
        container: document.documentElement
    })

    heatmap.setData({
        max,
        data
    })
}

const paintMouse = data => {
    const createMouseElement = () => {
        const mouse = document.createElement('div')
        mouse.style.cssText = `
            position: absolute;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            top: 0px;
            left: 0px;
            transition: 0.1s;
            border: 2px solid rgba(0,0,0,.5);
            background: hsl(${360 * Math.random()}, 100%, 65%)
        `

        document.body.appendChild(mouse)
        return mouse
    }

    const onMove = (x, y, mouse) => {
        mouse.style.transform = `translate(${x}px, ${y}px)`
    }

    const onClick = (mouse) => {
        mouse.style.boxShadow = "0 0 0 10px black inset"
        setTimeout(() => {
            mouse.style.boxShadow = ""
        }, 100);
    }

    const mouse = createMouseElement()
    if(data.length) {
        const start = data[0].time
        data.forEach(item => {
            setTimeout(() => {
                if(item.type === 'mousemove') onMove(item.x, item.y, mouse)
                if (item.type === 'click') onClick(mouse)
            }, item.time - start);
        })
    }
}

const postData = (url, data) => {
    const name = Date.now()
    fetch(`${url}/?name=${name}`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
}

const getData = async (url, total) => {
    const dataResponse = await fetch(url)
    const dataJson = await dataResponse.json()

    const eachResponse = await Promise.all(dataJson.map(name => fetch(`${url}/${name}`)))
    const eachJson = await Promise.all(eachResponse.map(r => r.json()))

    eachJson.forEach(data => paintMouse(data))
    paintHeatMap(eachJson.flat(), 300)
}

const totalData = getData("http://localhost:3001/api")

const data = trackCLickStream()
window.onbeforeunload = () => postData("http://localhost:3001/api", data)

// paintLive(data)