var Vue = require("vue");
var $ = require("./jquery-2.1.4.min");

Vue.component("stock", {
	props: ['code'],
	template: '#child-template',
	data: function() {
		return {
			result: null
		}
	},
	events: {
		"results": function(code, result) {
			if(code.indexOf(this._props.code.raw) ==  -1)
				return;
			var ret = result.split(",");
			var lastPrice = ret[2];
			var percent = (ret[3] - ret[2]) * 100 /ret[2];
			this.result = parseFloat(ret[3],10).toFixed(2) + " " + percent.toFixed(2) 
			+ " " + parseFloat(ret[4],10).toFixed(2) + " " + parseFloat(ret[5],10).toFixed(2); 

		}
	},
	created: function() {
		this.result = this._props.code.raw;
	}
});

new Vue({
	el: "#stock",
	data: {
		codes: null,
		timeout: 4000,
		timer: null,
		startTimer: null
	},
	ready: function() {
		this.codes = this.$children.map(function(childComponent) {
			var code = childComponent._props.code.raw + "";
			if(/^\d+/.test(code))
				code = code.indexOf("6") == 0 ? "sh" + code : "sz" + code;
			return code;
		});
		console.log(this.codes.join(","));
		//this.start();
	},
	methods: {
		fetchData: function() {
			var _this = this;
			this.clearTimer();
			this.timer = setInterval(function(){
				_this.getPrice();
			}, this.timeout);	  				
		},
		getPrice: function() {
			var _this = this;
			var apiUrl = "http://localhost:3333/api/query/" + this.codes.join(",");
			var xhr = new XMLHttpRequest();
			xhr.open('GET', apiUrl);
			xhr.onload = function () {
				var responseText = xhr.responseText;
				eval(responseText);
				console.log(responseText);
				_this.codes.forEach(function(code) {
					var result = eval("hq_str_" + code);
					_this.$broadcast("results", code, result);
					return result;
				});
			}
			xhr.send();
		},
		clearTimer: function() {
			if(this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}	
			if(this.startTimer) {
				clearTimeout(this.startTimer);
				this.startTimer = null;
			}		
		},
		start: function() {
			this.getPrice();
			var _this = this;
			this.startTimer = setTimeout(function(){_this.fetchData();}, this.timeout);
		},
		controllHandler: function(e) {
			this.clearTimer();
			if(e.target.value == "stop") {
				e.target.value = "start";
			} else {
				e.target.value = "stop";
				this.start();
			}
		}
	}
});


new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue.js!'
  },
  methods: {
    reverseMessage: function (e) {
      this.message = this.message.split('').reverse().join('');
      alert(e.target.tagName);
    }
  }
});

var example1 = new Vue({
  el: '#example-1',
  data: {
    items: [
      { message: 'Foo' },
      { message: 'Bar' }
    ]
  }
});

var exampleVM2 = new Vue({
  el: '#example-2',
  data: {
    greeting: true,
    classA:"class-a",
    classB:"class-b",
    submitHandler: function() {
    	alert("fuck");
    }
  },
  created: function () {
    console.log('greeting is: ' + this.greeting)
  }
});	

// define
var MyComponent = Vue.extend({
  props: ['msg'],
  template: '<div>A custom component! {{msg}}</div>'
})

// register
Vue.component('my-component', MyComponent)

// create a root instance
new Vue({
  el: '#example-component'
})