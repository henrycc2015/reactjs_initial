//ReactElement --- 虚拟dom概念
function ReactElement(type, key, props){
    this.type = type;
    this.key = key;
    this.props = props;
}

React = {
    nextReactRootIndex : 0,
    createElement: function(type, config, children){
        var props = {}, propName;
        config = config || {};
        var key = config.key || null;

        for(propName in config){
            if(config.hasOwnProperty(propName) && propName !== 'key'){
                props[propName] = config[propName];
            }
        }

        var childrenLen = arguments.length -2;
        if(childrenLen ===1){
            props.children = $.isArray(children) ? children : [children];
        } else if (childrenLen > 1){
            var childArr = Array[childrenLen];
            for(var i=0; i< childrenLen; i++){
                childArr[i] = arguments[i+2];
            }
            props.children = childArr;
        }
        return new ReactElement(type, key, props);
    },
    render: function(element, container) {
        //工厂类，进入生成虚拟dom实例方法
        var componentInstance = instantiateReactComponent(element);
        var markup = componentInstance.mountComponent(React.nextReactRootIndex++);
        $(container).html(markup);
        $(document).trigger('mountReady');
    }
}
//component类，用来表示文本在渲染、更新、删除时应该做些什么
function ReactDOMTextComponent(text){
    this._currentElement = ''+ text;
    this._rootNodeID = null;
}
ReactDOMTextComponent.prototype.mountComponent = function(rootID){
    this._rootNodeID = rootID;
    return '<span data-reactid="' + rootID + '">' + this._currentElement + '</span>';
}

function ReactDOMComponent(element){
    this._currentElement = element;
    this._rootNodeID = null;
}

ReactDOMComponent.prototype.mountComponent = function(rootID){
    this._rootNodeID = rootID;
    var props = this._currentElement.props;
    var tagOpen = '<' + this._currentElement.type;
    var tagClose = '</' + this._currentElement.type + '>';
    tagOpen += ' data-reactid=' + this._rootNodeID;
    
    for(var propKey in props){
        if(/^on[A-Za-z]/.test(propKey)) {
            var eventType = propKey.replace('on','');

            $(document).delegate('[data-reactid="' + this._rootNodeID + '"]',eventType+ '.' + this._rootNodeID, props[propKey]);
        }
        if(props[propKey] && propKey != 'children' && !/^on[A-Za-z]/.test(propKey)){
            tagOpen += " " + propKey + '=' + props[propKey];
        }
    }

    var content = '';
    var children = props.children || [];

    var childrenInstance = [];
    var self = this;
    $.each(children, function(key, child){
        var childComponentInstance = instantiateReactComponent(child);
        childComponentInstance._mountIndex = key;
        childrenInstance.push(childComponentInstance);

        var curRootId = self._rootNodeID + '.' + key;
        var childMarkup = childComponentInstance.mountComponent(curRootId);

        content += ' ' + childMarkup;
    })

    this._renderedChildren = childrenInstance;

    return tagOpen + '>' + content + tagClose;
}

function instantiateReactComponent(node){
    if(typeof node === 'string' || typeof node === 'number'){
        return new ReactDOMTextComponent(node);
    }
    if(typeof node === 'object' || typeof node.type === 'string'){
        return new ReactDOMComponent(node);
    }
}
function hello(){
    alert('hello');
}
var element = React.createElement('div',{id:'test', onclick:hello},'click me')

React.render(element,document.getElementById('container'))
