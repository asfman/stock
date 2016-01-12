$.getJSON("/api/suggest/002673",function(data){
	alert(JSON.stringify(data.Result[0]))
});	
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
				order: 0,
				theads: ["名称", "最新", "涨跌", "涨幅", "昨日", "最高", "最低"]
			};
		},   		
  		ready: function() {
  			if(!this.stocks) this.stocks = defaultStocks;
  			this.start();
  		},
  		destroyed: function() {
  			this.clearTimer();
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
				this.results = this.results_data.slice(0);
				console.log("this.order: " + this.order);
				if(this.order == 1) {
					this.results.sort(function(a, b){
						return ((b[0][3] - b[0][2]) * 100 / b[0][2]).toFixed(2) - ((a[0][3] - a[0][2]) * 100 / a[0][2]).toFixed(2);
					});
				} 
				if(this.order == -1) {
					this.results.sort(function(a, b){
						return ((a[0][3] - a[0][2]) * 100 / a[0][2]).toFixed(2) - ((b[0][3] - b[0][2]) * 100 / b[0][2]).toFixed(2);
					});
				} 
				var _this = this;
				var results = [];
				this.results.forEach(function(ret) {
					var result = [];
					result[0] = [ret[0][0], ret[1].replace(/s[z|h]/,"")];//[name, code]
					result[1] = parseFloat(ret[0][3], 10).toFixed(2);//curPrice
					result[2] = (ret[0][3] - ret[0][2]).toFixed(2);//diff		
					result[3] = ((ret[0][3] - ret[0][2]) * 100 / ret[0][2]).toFixed(2);//percent
					result[4] = parseFloat(ret[0][2],10).toFixed(2);//yestodayPrice		
					result[5] = parseFloat(ret[0][4],10).toFixed(2);//highestPrice		
					result[6] = parseFloat(ret[0][5],10).toFixed(2);//lowestPrice	
					results.push(result);
				});
				this.results = results;	
			},
			orderHandler: function(e) {
				var order = parseInt($(e.target).data("order"), 10);
				switch(order) {
					case 0:
						order= 1;
						$(e.target).html("涨幅↑");
					break;
					case 1:
						order= -1;
						$(e.target).html("涨幅↓");
					break;
					case -1:
						order= 0;
						$(e.target).html("涨幅");
					break;
				}
				this.order = order;
				$(e.target).data("order", order);
				this.formatResult();
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