if (!window._taskArr) {
    window._taskId = 0;
    window._taskArr = {};
    window._taskHook = {};
}

var tasks = {};

tasks.create = function(taskType, taskOpts, callback) {
    callback = callback || false;
    
    window._taskArr[ ++window._taskId ] = {
        "id": window._taskId,
        "type": taskType,
        "opts" : taskOpts,
        "status": "准备",
        "startTime": new Date().getTime()
    };
    
    if (callback) {
        tasks.setHook(window._taskId, callback);  
    }

    var execute = require("./task/" + taskType);
    if (execute) {
        execute(window._taskArr[window._taskId]);
    }
    
    return window._taskId;
};

tasks.update = function(taskId, update) {
    update = update || {};

    var task = tasks.getById(taskId), 
        key;
    
    for (key in update) {
        task[key] = update[key];
    }

    if (window._taskHook[taskId]) {
        window._taskHook[taskId](task);
    }

    window._taskArr[taskId] = task;
};

tasks.getById = function(id) {
    if (id) {
        if (window._taskArr[id]) return window._taskArr[id];
        return false;
    } 
    
    return window._taskArr;
};

tasks.remove = function(taskId) {
    var taskInfo = tasks.getById(taskId);
    if (taskInfo) {
        delete window._taskArr[taskId];
    }
};

tasks.setHook = function(taskId, hook) {
    window._taskHook[taskId] = hook;
};

module.exports = tasks;