window.TaskManager = (() => {
    let module = {};

    module.db = 'http://localhost:8888/tasks';

    module.tasks = [];
    module.tags = [];

    module.stringToColour = function (str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        let colour = '#';
        for (let i = 0; i < 3; i++) {
            let value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }

    module.invertColor = function (hex, bw) {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        var r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        if (bw) {
            // http://stackoverflow.com/a/3943023/112731
            return (r * 0.299 + g * 0.587 + b * 0.114) > 186
                ? '#000000'
                : '#FFFFFF';
        }
        // invert color components
        r = (255 - r).toString(16);
        g = (255 - g).toString(16);
        b = (255 - b).toString(16);

        function padZero(str, len) {
            len = len || 2;
            var zeros = new Array(len).join('0');
            return (zeros + str).slice(-len);
        }

        // pad each with zeros and return
        return "#" + padZero(r) + padZero(g) + padZero(b);
    }

    module.Task = class Task {
        constructor(id = 'undefinedd', name = 'untitled', duration = 0, tags = []) {
            this.id = id
            this.name = name
            this.duration = duration
            this.tags = []
            $.map(tags, (tag, id) => {
                let tage = new TaskManager.Tag(tag)
                this.tags.push(tage)
                module.tags.push(tage)
            })
        }

        display_item() {
            return $('<div class="col-sm-6">').append($('<div>')
                .addClass('task')
                .append(this.display_name())
                .prop("id", this.id)
                .append($('<div>')
                    .append(this.display_duration())
                    .append(this.display_tags())))
        }

        display_name() {
            return $('<div>')
                .addClass('task-head row')
                .append($('<div>')
                    .addClass('col-sm-10')
                    .text(this.name))
                .append($('<div>')
                    .addClass('col-sm-1')
                    .text('X').click({'taskid': this.id}, function (event) {
                        $.ajax({
                            url: module.db + '/' + event.data.taskid,
                            type: 'DELETE'
                        }).done(function () {
                            $('#tasks').empty()
                            TaskManager.display_tasks('#tasks');
                        })
                    }))
        }

        display_duration() {
            let item = $('<div>').addClass('duration').text(this.duration);
            if (this.duration <= 10) {
                item.addClass('short');
            } else if (this.duration >= 20) {
                item.addClass('long');
            }
            return item;
        }

        display_tags() {
            let container = $('<div>').addClass('tags')
            $.map(this.tags, (tag) => {
                container.append(tag.display_item())
            })
            container.append(
                $('<div>')
                    .addClass('tag').text("+")
                    .click(function (event) {
                            $(this).parent().append($(
                                '<div class="tag newTag">' +
                                '<form>' +
                                '<input style="width:120px;" type="text" name="tag_name" required value="dd" placeholder="Input tag name" >' +
                                '<button onclick="TaskManager.post_tag(' + "$(event.target).parents('.task').attr('id')" + ',' + "$(this).parents('form').serialize()" + ')" class="btn btn-primary btn-sm" style="margin-left: 12px" type="button">Add</button>' +
                                '</form>' +
                                '</div>'
                                )
                            )
                        }
                    )
                    .css("background-color", module.stringToColour("+"))
                    .css("color", module.invertColor(module.stringToColour("+"), 1))
            )
            return container;
        }
    }

    module.Tag = class Tag {
        constructor(name = 'untitled') {
            this.name = name;
        }

        display_item() {
            return $('<div>').addClass('tag').text(this.name)
                .css("background-color", module.stringToColour(this.name))
                .css("color", module.invertColor(module.stringToColour(this.name), 1))
                .append($('<span>').text("  x").click({idtag: this.name}, function (event) {
                        $.ajax({
                            url: module.db + '/' + $(event.target).parents('.task').attr('id') + '/tags/' + event.data.idtag,
                            type: 'DELETE'
                        }).done(function () {
                            $('#tasks').empty()
                            TaskManager.display_tasks('#tasks');
                        })
                    })
                )
        }
    }

    module.post_tag = (idtask, tees) => {
        let url = module.db + '/' + idtask + '/tags';
        console.log(idtask);
        $.post(url, tees).done(function () {
            $('#tasks').empty()
            TaskManager.display_tasks('#tasks');
        })
    }

    module.display_tasks = (div_id) => {
        $.get(module.db).done((data) => {
            $.map(data, (task, id) => {
                module.tasks[id] = new TaskManager.Task(id, task.name, task.duration, task.tags)
                $(div_id).append(module.tasks[id].display_item())
            })
            $(div_id).append($('<div class="col-sm-6">')
                .append($('<div>').addClass('task').text('Add a new task').css("text-align", "center")))
        }).fail((jqXHR, status, error) => {
            alert('Ajax fail : ' + status + ' ' + error);
        });

    }
    return module;
})
();


$(() => {
    TaskManager.display_tasks('#tasks');
});
