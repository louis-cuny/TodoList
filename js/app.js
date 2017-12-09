window.TaskManager = (() => {
  let module = {};
   
  module.Task = class Task {
    constructor(name = 'untitled', duration = 0, tags = null) {
      this.name = name;
      this.duration = duration;
      this.tags = tags;
    }
  
    display_item() {
      let properties = $('<ul>');
      properties.append(this.display_duration());
      properties.append(this.display_tags());
      return $('<li>')
             .addClass('task')
             .append(this.display_name())
             .append(properties);
    }
    
    display_name() {
      return $('<span>')
             .addClass('name')
             .text(this.name);
    }
    
    display_duration() {
      let item = $('<li>').addClass('duration').text(this.duration);
      if (this.duration <= 10) {
        item.addClass('short');
      } else if (this.duration >= 20) {
        item.addClass('long');
      }
      return item;
    }
    
    display_tags() {
      let container = $('<li>').addClass('tags').text(this.tags);
      let field = $('<input>').prop('type', 'text');
      let button = $('<input>').prop('type', 'submit');
      let editor = $('<form>').append(field).append(button);
      
      let task = this;
      
      let in_edit = false;
      
      container.click((event) => {
        event.stopPropagation();
        event.preventDefault();
        
        let target = $(event.target);
        
        if (target.is('li') && !in_edit) {
          container.empty();
          container.append(editor);
          in_edit = true;
        }
        
        if (target.is('input') && target.prop('type') === 'submit') {
          task.tags = field.val();
          container.empty();
          container.text(task.tags);
          in_edit = false;
        }
        
      });
      
      return container;
    }
  }
  
  module.tasks = [];
  
  module.display_tasks = (div_id) => {
    let container = $('<ul>').prop('id', 'tasks');
    $(div_id).append(container);
    
    for (let task of module.tasks) {
      $(container).append(task.display_item());
    }
  }
  
  return module;
})();


$(() => {
  TaskManager.tasks.push(new TaskManager.Task('tache 1', 10, 'test1'));
  TaskManager.tasks.push(new TaskManager.Task('tache 2', 20, 'test2'));
  TaskManager.tasks.push(new TaskManager.Task('tache 3', 15, 'test1'));

  TaskManager.display_tasks('#taskmanager');
});
