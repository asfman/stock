require.config({
	baseUrl: '/javascripts',
    paths: {
    	jquery: 'jquery-2.1.4.min',
    	vue: 'vue-dev'
    }
});
require(["jquery", "vue"], function($, Vue){
	$(function(){
		$("#example-1").css("color", "red");
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
					this.result = formatResult(result);
				}
			},
			created: function() {
				this.result = this._props.code.raw;
			}
		});
		var xhr = new XMLHttpRequest();
		new Vue({
			el: "#stock",
			data: {
				codes: null,
				timeout: 5000,
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
					if(xhr.readyState == 1)
						xhr.abort();			
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
			el: "#stock-search",
			data: {
				code: null,
				result: null
			},
			methods: {
				getPrice: function() {
					code = this.code;
					if(!code) return;
					code += "";
					if(code.length != 6 && code.length != 8) return;
					if(code.length == 6)
						code = code.indexOf("6") == 0 ? "sh" + code : "sz" + code; 
					var apiUrl = "http://localhost:3333/api/query/" + code;
					xhr.open('GET', apiUrl);
					var _this = this;
					xhr.onload = function () {
						var responseText = xhr.responseText;
						eval(responseText);
						console.log(responseText);
						var result = eval("hq_str_" + code);
						 _this.result = formatResult(result);	
					}
					xhr.send();
				}
			}
		})

		function formatResult(result) {
			var ret = result.split(",");
			var lastPrice = ret[2];
			var percent = (ret[3] - ret[2]) * 100 /ret[2];
			return parseFloat(ret[3],10).toFixed(2) + " " + percent.toFixed(2) 
			+ " " + parseFloat(ret[2],10).toFixed(2)
			+ " " + parseFloat(ret[4],10).toFixed(2) 
			+ " " + parseFloat(ret[5],10).toFixed(2); 	
		}    		
    });
});