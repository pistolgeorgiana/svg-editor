window.onload = function () {
    const namespace = "http://www.w3.org/2000/svg"
    const svg = document.getElementById("svg_edit")

    var mode = false
    var move = false

    var onClick = new this.Audio("./media/button.mp3")
    var onDraw = new this.Audio("./media/draw.mp3")

    document.getElementById("mode").onclick = function() {
        if(mode) {
            mode = false
            $('svg').css('cursor', 'crosshair')
        } else {
            mode = true
            $('svg').css('cursor', 'default')
        }
    }

    document.getElementById("remove").onclick = function() {
        $("#drawElem *").remove()
    }

    function rect(el, x1, x2, y1, y2) {
        el.setAttribute("x", Math.min(x1, x2))
        el.setAttribute("y", Math.min(y1, y2))
        el.setAttribute("width", Math.max(x1, x2) - Math.min(x1, x2))
        el.setAttribute("height", Math.max(y1, y2) - Math.min(y1, y2))
    }

    function ellipse(el, x1, x2, y1, y2) {
        el.setAttribute("rx", ((Math.max(x1, x2) - Math.min(x1, x2))/2))
        el.setAttribute("ry", ((Math.max(y1, y2) - Math.min(y1, y2))/2))
        el.setAttribute("cx", (x1 + x2)/2)
        el.setAttribute("cy", (y1 + y2)/2)
    }

    function line(el, _x1, _y1, _x2, _y2) {
        $(el).attr({
            x1:_x1, x2:_x2, y1:_y1, y2:_y2 
        })
    }

    function text(el, x1, y1) {
        $(el).attr({
            x: x1, y: y1
        })
    }

    function polygonF(el, list) {
        el.setAttribute("points", list)
    }

    function createPolygon() {
        var pointList = []
        let index = 0

        this.setPoint = function (x, y) {
            pointList[index] = [x, y];
            index++
        };

        this.getPoints = function () {
            return pointList;
        }
    }

    function inputProps(obj) {
        document.getElementById("first_point").value = $(obj).attr('x')
        document.getElementById("second_point").value = $(obj).attr('y')
        document.getElementById("third_point").value = $(obj).attr('width')
        document.getElementById("fourth_point").value = $(obj).attr('height')
    }

    function deleteProps() {
        document.getElementById("first_point").value = ""
        document.getElementById("second_point").value = ""
        document.getElementById("third_point").value = ""
        document.getElementById("fourth_point").value = ""
    }

    function cursorPosition(event, element) {
        return {
            X : event.pageX - element.getBoundingClientRect().left, 
            Y : event.pageY - element.getBoundingClientRect().top
        }
    }

    function load() {
        const LEFT_CLICK=1
        let deDesenat = 'Rectangle'
        let txt = ''
        let x1=0, y1=0, offsetX=0, offsetY=0
        var rotate = false

        var polygon = new createPolygon()
        var position = {}
        var elementCurent
        var elementPolygon

        $(document).keyup(function(key) {
            if(key.keyCode === 46) {
                if(elementCurent) {
                    elementCurent.remove()
                }
            } else if (key.keyCode === 13) {
                if(elementCurent && mode) {
                    $(elementCurent).attr({ x : $("#first_point").val(), y : $("#second_point").val(),
                        width: $("#third_point").val(), height : $("#fourth_point").val()
                })
                }
            }
        })

        document.getElementById("rotate").addEventListener("click", function(e) {
            if(elementCurent && mode && rotate) {
                $(elementCurent).attr("transform", "rotate(-90, " 
                    + $(elementCurent).attr("x") + ", " 
                    + $(elementCurent).attr("y") + ")")
            }
        })

        function btnclick(value) {
            deDesenat = $(value)[0].getAttribute('value')
            mode = false
            $('svg').css('cursor', 'crosshair')
            onClick.play()
            $("#text_header").css("display", "none")
        }

        $('input:button[id^="rect"]').click(() => {
            btnclick('input:button[id^="rect"]')
        })

        $('input:button[id^="ellipse"]').click(() => {
            btnclick('input:button[id^="ellipse"]')
        })

        $('input:button[id^="line"]').click(() => {
            btnclick('input:button[id^="line"]')
        })

        $('input:button[id^="polygon"]').click(() => {
            btnclick('input:button[id^="polygon"]')
            polygon = new createPolygon()
            elementPolygon = null
        })

        $('input:button[id^="text"]').click(() => {
            btnclick('input:button[id^="text"]')
            $("#text_header").show()
            document.addEventListener("keyup", (key) => {
                if(key.keyCode === 13) {
                    txt = $("#input_text").val().toString()
                }
            })
        })

        $('#color_button').on("change", function(e) {
            if(elementCurent) {
                $(elementCurent).css("fill", e.target.value)
            }
        })

        $(svg).contextmenu(() => { return false })

        $(svg).on("mousedown", mouseDown)
              .on("mouseup", mouseUp)
              .on("mousemove", mouseMove)

        function mouseDown(e) {
            if(e.which == LEFT_CLICK && !mode) {
                position = cursorPosition(e, svg)
                x1 = position.X
                y1 = position.Y
            
                switch (deDesenat) {
                    case 'Rectangle':
                        rect(document.getElementById("dashedRect"), x1, x1, y1, y1)
                        $("#dashedRect").show()
                        break
                    case 'Ellipse':
                        ellipse(document.getElementById("dashedEllipse"), x1, x1, y1, y1)
                        $("#dashedEllipse").show()
                        break
                    case 'Line':
                        line(document.getElementById("dashedLine"), x1, y1, x1, y1)
                        $("#dashedLine").show()
                        break
                }
            }
        }
        function mouseUp(e) {
            onDraw.play()
            if(e.which == LEFT_CLICK && !mode) {
                position = cursorPosition(e, svg)
                x2 = position.X
                y2 = position.Y

                switch (deDesenat) {
                case 'Rectangle':
                    $("#dashedRect").hide();
                    var newRect = document.createElementNS(namespace, "rect")
                    rect(newRect, x1, x2, y1, y2)
                    $(newRect).appendTo($("#drawElem"))
                    $(newRect).mousedown(function(e) {
                        if(mode) {
                            inputProps(newRect)
                            move = true
                            $("#drawElem *").attr("cursor", "move").attr("class", "")
                            $(this).attr("class", "clicked")
                            elementCurent = this
                            position = cursorPosition(e, svg)
                            offsetX = position.X - $(this).attr('x')
                            offsetY = position.Y - $(this).attr('y')
                        }
                    }).mousemove(function(e) {
                        if(mode && move) {
                            position = cursorPosition(e, svg)
                            offsetX = position.X - offsetX 
                            offsetY = position.Y - offsetY 
                            $(elementCurent).attr('x', offsetX)
                            $(elementCurent).attr('y', offsetY)
                        }
                    }).mouseup(function(e) {
                        move = false
                        document.getElementById("first_point").value = $(this).attr('x')
                        document.getElementById("second_point").value = $(this).attr('y')
                        document.getElementById("third_point").value = $(this).attr('width')
                        document.getElementById("fourth_point").value = $(this).attr('height')
                    })
                    break;
                case 'Ellipse':
                    $("#dashedEllipse").hide();
                    var newEllipse = document.createElementNS(namespace, "ellipse")
                    ellipse(newEllipse, x1, x2, y1, y2)
                    $("#drawElem").append(newEllipse)
                    newEllipse.addEventListener("mousedown", function(e) {
                        downMove(this)
                    })
                    break;
                case 'Line':
                    $("#dashedLine").hide();
                    var newLine = document.createElementNS(namespace, "line")
                    line(newLine, x1, y1, x2, y2)
                    $("#drawElem").append(newLine)
                    break;
                case 'Text':
                    var newText = document.createElementNS(namespace, "text")
                    text(newText, x2, y2)
                    $(newText).text(txt)
                    $("#drawElem").append(newText)
                    newText.addEventListener("mousedown", function(e) {
                        downMove(this)
                        rotate = true
                        $("#text_header").show()
                        $("#input_text").val(this.textContent).keyup((key) => {
                            if(key.keyCode === 13) {
                                $(elementCurent).text(txt)
                            }
                        })
                    })
                    break;
                case 'Polygon':
                    if(elementPolygon) {
                        $(elementPolygon).remove()
                    }
                    polygon.setPoint(x2, y2); 
                    elementPolygon = document.createElementNS(namespace, "polygon")
                    polygonF(elementPolygon, polygon.getPoints())
                    $("#drawElem").append(elementPolygon)
                    elementPolygon.addEventListener("mousedown", function(e) {
                        downMove(this)
                    })
                    break;
                }
            }
        }
        function mouseMove(e) {
            if(!mode) {
                position = cursorPosition(e, svg)
                x2 = position.X
                y2 = position.Y

                switch (deDesenat) {
                    case 'Rectangle':
                        rect(document.getElementById("dashedRect"), x1, x2, y1, y2)
                        break
                    case 'Ellipse':
                        ellipse(document.getElementById("dashedEllipse"), x1, x2, y1, y2)
                        break
                    case 'Line':
                        line(document.getElementById("dashedLine"), x1, y1, x2, y2)
                        break
                }
            }
        }

        function downMove(obj) {
            if(mode) {
                deleteProps()
                $("#text_header").hide()
                $("#drawElem *").attr("cursor", "move").attr("class", "")
                $(obj).attr("class", "clicked")
                elementCurent = obj
                rotete = false
            }
        }
    }

    load()
}