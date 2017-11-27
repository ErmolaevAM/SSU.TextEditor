(function ($) {
    var editor = $('.content');
    var clipboardData = {
        data: null,
        setData: function() {
          data = getSelectionHtml();
        },
        getData: function () {
            return data;
        }
    };
    $('a[data-command]').click(function (e) {
        setTimeout(function () {
            editor.focus();
        }, 0);
        var command = $(this).data('command');
        switch (command) {
            case 'insertimageFile':
                $('input[type=file]').click();
                break;
            case 'insertJson':
                $('.import').click();
                break;
            case 'exportJson':
                exportFile();
                break;
            case 'insertimage':
                url = prompt('Enter the link here: ', '');
                if (url) {
                    document.execCommand(command, false, url);
                }
                break;
            case 'insertTable':
                document.execCommand("insertHTML", false, createTable());
                break;
            case 'print':
                initPrint();
                break;
            case 'copy':
                clipboardData.setData();
                document.execCommand('copy', false, null);
                break;
            case 'pastePlainText':
                editor.focus();
                pasteText(clipboardData.getData());
                break;
            default:
                document.execCommand(command, false, null);
        }
    });

    $("input[type=file]").change(function () {
        var inp = $("input[type=file]");
        if (inp.val() === "") {
            return;
        }
        inp.val("");
    });

    $(".import").change(function () {
        var inp = $(".import");
        if (inp.val() === "") {
            return;
        }
        inp.val("");
    });

    window.previewFile = function () {
        var file = $('input[type=file]').prop('files')[0];
        var reader = new FileReader();
        reader.onload = function () {
            document.execCommand('insertHTML', false,
                "<img src='" + reader.result + "'/>");
            file.value = null;
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };
    window.importFile = function () {
        var file = $('.import').prop('files')[0];
        var reader = new FileReader();
        reader.onload = function () {
            document.execCommand('insertHTML', false, reader.result);
            file.value = null;
        };
        if (file) {
            reader.readAsText(file);
        }
    };

    function exportFile() {
        var name = prompt('Enter name here: ', '');
        var text = editor.html();
        var textFileAsBlob = new Blob([text], {type: 'application/json'});
        var downloadLink = document.createElement("a");
        downloadLink.download = name + '.json';
        if (window.webkitURL) {
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }
        else {
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
    }

    function pasteText(text) {
        var cursorPos = document.getSelection().focusOffset;
        var v = editor.text().trim();
        var textBefore = v.substring(0,  cursorPos);
        var textAfter  = v.substring(cursorPos, v.length);

        editor.text(textBefore + text + textAfter);
    }

    function initPrint() {
        var mywindow = window.open('', 'PRINT', 'height=400,width=600');
        mywindow.document.write('<html>');
        mywindow.document.write('<head></head>');
        mywindow.document.write('<body>');
        mywindow.document.write($('.content').html());
        mywindow.document.write('</body>');
        mywindow.document.write('</html>');
        mywindow.document.close();
        mywindow.focus();
        mywindow.print();
        mywindow.close();
    }

    function createTable() {
        const rowsNumber = $('#row-count').val();
        const colsNumber = $('#col-count').val();
        var tableStr = "<table class='new-table'>";
        tableStr += "<thead><tr>";
        for (var i = 0; i < colsNumber; i++) {
            tableStr += "<th></th>";
        }
        tableStr += "</tr></thead><tbody>";
        for (var i = 0; i < rowsNumber; i++) {
            tableStr += "<tr>";
            for (var j = 0; j < colsNumber; j++) {
                tableStr += "<td></td>"
            }
            tableStr += "</tr>";
        }
        tableStr += "</tbody>";
        tableStr += "</table>";
        return tableStr
    }

    function getSelectionHtml() {
        var html = "";
        if (window.getSelection) {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var container = document.createElement("div");
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        } else if (document.selection) {
            if (document.selection.type === "Text") {
                html = document.selection.createRange().htmlText;
            }
        }
        return html;
    }
})(jQuery);