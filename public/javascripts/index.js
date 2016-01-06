var Vue = require("vue");
var $ = require("./jquery-2.1.4.min");

var xhr = new XMLHttpRequest();
new Vue({
	el: "#stock-search",
	data: {
		code: null,
		result: null
	},
	methods: {
		getPrice: function() {
			code = this.code;
			if(!code) return this.result="";
			code += "";
			code = code.toLowerCase();
			if(code.length != 6 && code.length != 8) return;
			if(code.length == 6)
				code = code.indexOf("6") == 0 ? "sh" + code : "sz" + code; 
			var apiUrl =  "/api/query/" + code;
			xhr.open('GET', apiUrl);
			var _this = this;
			xhr.onload = function () {
				var responseText = xhr.responseText;
				eval(responseText);
				console.log(responseText);
				var result = eval("hq_str_" + code);
				 _this.result = "<table cellspacing='0' cellpadding='0'>" + formatResult(result.split(","), code) + "</table>";	
			}
			xhr.send();
		}
	}
})

function formatResult(ret, code) {
	var sHtml = "<tr>";
	var sCode = "<td>" + ret[0] + "<br />" + code.replace(/s[hz]/, "") + "</td>";
	var curPrice = "<td>" + parseFloat(ret[3],10).toFixed(2) + "</td>";
	var percent = ((ret[3] - ret[2]) * 100 /ret[2]).toFixed(2);
	percent = "<td class='" + (percent > 0 ? "red" : (percent < 0 ? "green": "")) + "'>" + percent + "%</td>";
	var diff = (ret[3] - ret[2]).toFixed(2);
	diff = "<td class='" + (diff > 0 ? "red" : (diff < 0 ? "green": "")) + "'>" + diff + "</td>";
	var yestodayPrice = "<td class='gray'>" + parseFloat(ret[2],10).toFixed(2) + "</td>";
	var highestPrice = "<td>" + parseFloat(ret[4],10).toFixed(2) + "</td>";
	var lowestPrice = "<td>" + parseFloat(ret[5],10).toFixed(2)+ "</td>";
	sHtml += sCode + curPrice + diff + percent + yestodayPrice + highestPrice + lowestPrice;
	sHtml += "</tr>";
	return sHtml;	
}

function initSortable(vm) {
	var Sortable = require("./Sortable");
	var el = document.getElementById('editable');
	// Editable list
	var editableList = Sortable.create(el, {
		filter: '.js-remove',
		//handle: '.drag-handle',
		animation: 150,	
		onFilter: function (evt) {
			//var el = editableList.closest(evt.item); // get dragged item
			//el && el.parentNode.removeChild(el);
			vm.stocks.splice(evt.oldIndex, 1);
		},
		// dragging ended
		onEnd: function (/**Event*/evt) {
			if(evt.newIndex == evt.oldIndex) return;
			var arr = [];
			$(evt.item.parentNode).find(".code").each(function(){
				arr.push($(this).html());
			});
			vm.stocks = arr;
		    //console.log(evt.newIndex + " - " + evt.oldIndex);		
		}
	});	
}
var defaultStocks = ["sh000001", "sz399006", "600122", "300345"];
new Vue({
  el: '#stock_ct',
  data: {
    currentView: 'edit'
  },
  methods: {
  	switchTab: function(e) {
  		this.currentView = $(e.target).html();
  	},
  	order: function(e){
  		if($(e.target).hasClass("order-unselected")) {
  			//order up
  			$(e.target).removeClass('order-unselected');
  			this.$broadcast("order", 1);
  		} else {
  			//order normal
  			$(e.target).addClass("order-unselected");
  			this.$broadcast("order", 0);
  		}
  	}
  },
  components: { 	
  	realtime: {
  		template: "#results-template",
		data: function() {
			return {
				stocks: JSON.parse(localStorage.getItem("stocks")),
				timeout: 5000,
				timer: null,
				startTimer: null,
				results: null,
				results_data: null,
				order: 0
			};
		},   		
  		ready: function() {
  			if(!this.stocks) this.stocks = defaultStocks;
  			this.start();
  		},
  		destroyed: function() {
  			this.clearTimer();
  		},
  		events: {
  			order: function(msg) {
  				console.log("order: " + msg);
  				this.order = msg;
  				this.formatResult();
  			}
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
				if(!this.stocks) {
					console.log("stocks null");
					return;
				}
				var codes = [];
				this.stocks.forEach(function(code) {
					if(/^\d+/.test(code))
						code = code.indexOf("6") == 0 ? "sh" + code : "sz" + code; 
					codes.push(code);
				});
				var apiUrl = "/api/query/" + codes.join(",");
				xhr.open('GET', apiUrl);
				xhr.onload = function () {
					var responseText = xhr.responseText;
					eval(responseText);
					console.log(responseText);
					_this.results_data = [];
					codes.forEach(function(code) {
						var result = eval("hq_str_" + code);
						_this.results_data.push([result.split(","), code]);
					});
					_this.formatResult();
				}
				xhr.send();
			},
			formatResult: function() {
				if(!this.results_data || !this.results_data.length) return;
				var sortArr = [];
				console.log("this.order: " + this.order);
				if(this.order != 0) {
					sortArr = this.results_data.slice(0, -1)
					sortArr.sort(function(a, b){
						return (b[0][3] - b[0][2]) - (a[0][3] - a[0][2]);
					});
				} else {
					sortArr = this.results_data;
				}
				var results = [];
				sortArr.forEach(function(obj){
					var result = obj[0], code = obj[1];
					results.push(formatResult(result, code));
				});
				this.results = "<table cellspacing='0' cellpadding='0'>" + results.join("") + "</table>";
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
				if(!this.stocks || !this.stocks.length) return;
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
  	},
    edit: {
		template:"#editable-template",
		data: function() {
			return {
				stocks: defaultStocks
			};
		},
		watch: {
			'stocks': function(stocks) {
				if(this.stocks)
					localStorage.setItem("stocks", JSON.stringify(this.stocks));
			}
		},
		methods: {
			add: function(e) {
				this.stocks.push(e.target.value);
				e.target.value = "";
			}
		},
		ready: function() {
			if(localStorage.getItem("stocks"))
				this.stocks = JSON.parse(localStorage.getItem("stocks"));
			initSortable(this);
		},
		beforeDestroy: function() {
			if(this.stocks)
				localStorage.setItem("stocks", JSON.stringify(this.stocks));			
		}
	}
  }
})