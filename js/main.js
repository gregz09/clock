var radians = 0.0174532925,           //setting for wall clock
	clockRadius = 250,
	margin = 50,
	width = "100%",
    height = "100%",
    hourHandLength = 2*clockRadius/3,
    minuteHandLength = clockRadius,
    secondHandLength = clockRadius-12,
    secondHandBalance = 30,
    secondTickStart = clockRadius,
    secondTickLength = -3,
    minuteTickStart = clockRadius,
    minuteTickLength = -10,
    hourTickStart = clockRadius,
    hourTickLength = -20,
    secondLabelRadius = clockRadius + 16,
    secondLabelYOffset = 5,
    hourLabelRadius = clockRadius - 40,
    hourLabelYOffset = 7;

var hourScale = d3.scale.linear()
	.range([0,330])
	.domain([0,11]);

var secondScale = d3.scale.linear()
	.range([0,358])
	.domain([0,179]);

var minuteScale = d3.scale.linear()
	.range([0,354])
	.domain([0,59]);

var handData = [
	{
		type:'hour',
		value:0,
		length:-hourHandLength,
		scale:hourScale
	},
	{
		type:'minute',
		value:0,
		length:-minuteHandLength,
		scale:minuteScale
	},
	{
		type:'second',
		value:0,
		length:-secondHandLength,
		scale:minuteScale,
		balance:secondHandBalance
	}
];

var romanian = ["I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
var ifRomanian = false, ifHours = true, ifSeconds = true;
var state = 24;
var display = {		
	min : true,										//start settings
	sec : true,
	mill : false
}

var timezone = 0;									//timezone default +1:00 UTC

function drawClock(ifRomanian){ //create all the clock elements
	$('.clock').empty();
	updateData();
	var svg = d3.select(".clock").append("svg")
	    .attr("width", width)
	    .attr("height", height);

	var face = svg.append('g')
		.attr('id','clock-face')
		.attr('transform','translate(' + (clockRadius + margin) + ',' + (clockRadius + margin) + ')');

	face.selectAll('.minute-tick')
		.data(d3.range(0,60)).enter()
			.append('line')
			.attr('class', 'minute-tick')
			.attr('x1',0)
			.attr('x2',0)
			.attr('y1',minuteTickStart)
			.attr('y2',minuteTickStart + minuteTickLength)
			.attr('transform',function(d){
				return 'rotate(' + minuteScale(d) + ')';
			});

	face.selectAll('.second-tick')
		.data(d3.range(0,180)).enter()
			.append('line')
			.attr('class', 'second-tick')
			.attr('x1',0)
			.attr('x2',0)
			.attr('y1',secondTickStart)
			.attr('y2',secondTickStart + secondTickLength)
			.attr('transform',function(d){
				return 'rotate(' + secondScale(d) + ')';
			});
	//and labels

	face.selectAll('.second-label')
		.data(d3.range(1,61,1))
			.enter()
			.append('text')
			.attr('class', 'second-label')
			.attr('text-anchor','middle')
			.attr('x',function(d){
				return secondLabelRadius*Math.sin(minuteScale(d)*radians);
			})
			.attr('y',function(d){
				return -secondLabelRadius*Math.cos(minuteScale(d)*radians) + secondLabelYOffset;
			})
			.text(function(d){
				return d;
			});

	//... and hours
	face.selectAll('.hour-tick')
		.data(d3.range(0,12)).enter()
			.append('line')
			.attr('class', 'hour-tick')
			.attr('x1',0)
			.attr('x2',0)
			.attr('y1',hourTickStart)
			.attr('y2',hourTickStart + hourTickLength)
			.attr('transform',function(d){
				return 'rotate(' + hourScale(d) + ')';
			});

	face.selectAll('.hour-label')
		.data(d3.range(1,13,1))
			.enter()
			.append('text')
			.attr('class', 'hour-label')
			.attr('text-anchor','middle')
			.attr('x',function(d){
				return hourLabelRadius*Math.sin(hourScale(d)*radians);
			})
			.attr('y',function(d){
				return -hourLabelRadius*Math.cos(hourScale(d)*radians) + hourLabelYOffset;
			})
			.text(function(d){
				if(ifRomanian)
					return romanian[d-1]
				else
					return d;
			});


	var hands = face.append('g').attr('id','clock-hands');

	face.append('g').attr('id','face-overlay')
		.append('circle').attr('class','hands-cover')
			.attr('x',0)
			.attr('y',0)
			.attr('r',clockRadius/25);

	hands.selectAll('line')
		.data(handData)
			.enter()
			.append('line')
			.attr('class', function(d){
				return d.type + '-hand';
			})
			.attr('x1',0)
			.attr('y1',function(d){
				return d.balance ? d.balance : 0;
			})
			.attr('x2',0)
			.attr('y2',function(d){
				return d.length;
			})
			.attr('transform',function(d){
				return 'rotate('+ d.scale(d.value) +')';
			})
			.attr('color','red');

	$('.clock').append('<div class="digital">');
	$('.digital').hide();
	$('#s1').hide();$('#s2').hide();$('#s3').hide();$('#s4').hide();
	$('#s5').hide();$('#s6').hide();$('#s7').hide();
}

function moveHands(){
	d3.select('#clock-hands').selectAll('line')
	.data(handData)
		.transition()
		.attr('transform',function(d){
			return 'rotate('+ d.scale(d.value) +')';
		});

	var time = getTime(timezone);
	$('.digital').empty(); $('.digital-mini').empty();  $('.weekday').empty();
	$('.digital').append(time[0]); $('.digital-mini').append(time[1]); $('.weekday').append(time[2]);

}

function updateData(timezone){
	var t = new Date();
	if(timezone != 0)
		t.setTime(t.getTime() + t.getTimezoneOffset()*60*1000*timezone);
	handData[0].value = (t.getHours() % 12) + t.getMinutes()/60 ;
	handData[1].value = t.getMinutes();
	handData[2].value = t.getSeconds();
}

function getWeekDay(weekday){
	switch(weekday){
		case 0:
			return 'Sunday';
		case 1:
			return 'Monday';
		case 2:
			return 'Tuesday';
		case 3:
			return 'Wednesday';
		case 4:
			return 'Thursday';
		case 5:
			return 'Friday';
		case 6:
			return 'Saturday';
	}
}

function getTime(timezone){
	var t = new Date();
	var out = [];
	if(timezone != 0)
		t.setTime(t.getTime() + t.getTimezoneOffset()*60*1000*timezone);
	var hours = t.getHours();
	var minutes = t.getMinutes();
	var seconds = t.getSeconds();
	var milli = t.getMilliseconds();
	var day = t.getDate(); var month = t.getMonth()+1; var year = t.getFullYear();
	var outDate = day + "/" + month + "/" + year;
	var weekday = getWeekDay(t.getDay());


	if(hours < 10){
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	} if (!display.min) minutes = "";  
	if(seconds < 10){
		seconds = "0" + seconds;
	} seconds = " : " + seconds; if (!display.sec) seconds = ""; 
	if(!display.mill) milli = ""; else milli = "<span class='mil'> " + milli + "</span>";
	var outTime = "";
	if(state == 12){
		if (hours > 12){
			hours = hours - 12;
			outTime = hours + " : " + minutes + seconds + " PM";
		}else if( hours == 12){
			outTime = hours + " : " + minutes + seconds + " PM";
		}else{
			outTime = hours + " : " + minutes + seconds + " AM";
		}
	}else{
		outTime = hours + " : " + minutes + seconds + milli;
	}
	out.push(outTime);
	out.push(outDate);
	out.push(weekday);
	return out
}

$("document").ready(function(){
	drawClock(ifRomanian);
	setInterval(function(){
		updateData(timezone);
		moveHands();
	}, 100);
	$(".display").click(function(){
		if($(this).prop("checked") == true){
			display[$(this).attr('id')] = true;
		}else {
			display[$(this).attr('id')] = false;
		}
	});
	$('#radioBtn2 a').on('click', function(){
    	var sel = $(this).data('title');
    	var tog = $(this).data('toggle');
    	$('#'+tog).prop('value', sel);
    	if(sel == "min"){
    		display['min'] = true; display['sec'] = false; display['mill'] = false;
    	}else if(sel == 'sec'){
    		display['min'] = true; display['sec'] = true; display['mill'] = false;
    	}else{
    		display['min'] = true; display['sec'] = true; display['mill'] = true;
    	}

    	$('#radioBtn2').children().not('[data-title="'+sel+'"]').removeClass('active').addClass('notActive');
    	$('a[data-toggle="'+tog+'"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
	});
	$('.tick').click(function(){
		var selector = '.' + $(this).attr('id') + '-tick';
		if($(this).prop("checked") == true){
			$(selector).css('display','inline');
		}else {
			$(selector).css('display','none');
		}
	});
	$('.label1').click(function(){
		var selector = '.' + $(this).attr('id') + '-label';
		if($(this).prop("checked") == true){
			$(selector).css('display','inline');
		}else {
			$(selector).css('display','none');
		}
	});
	$('.hand').click(function(){
		var selector = '.' + $(this).attr('id') + '-hand';
		if($(this).prop("checked") == true){
			$(selector).css('display','inline');
		}else {
			$(selector).css('display','none');
		}
	});
	$('#radioBtn a').on('click', function(){
    	var sel = $(this).data('title');
    	var tog = $(this).data('toggle');
    	$('#'+tog).prop('value', sel);
    	state = sel;
    	if(state == '12'){
    		$('a[data-title="mill"').hide();
    	}else{
    		$('a[data-title="mill"').show();
    	}
    	$('#radioBtn').children().not('[data-title="'+sel+'"]').removeClass('active').addClass('notActive');
    	$('a[data-toggle="'+tog+'"][data-title="'+sel+'"]').removeClass('notActive').addClass('active');
	});
	$('.settings').click(function(){
		if($('svg').is(":visible")){
			if($('#s3').is(":visible")){
				$('#s3').slideUp();$('#s4').slideUp();$('#s5').slideUp();$('#s6').slideUp();$('#s7').slideUp();
				$('#down').removeClass().addClass('glyphicon glyphicon-chevron-down');
			} else{
				$('#s3').slideDown();$('#s4').slideDown();$('#s5').slideDown();$('#s6').slideDown();$('#s7').slideDown();
				$('#down').removeClass().addClass('glyphicon glyphicon-chevron-up');
			}
		}else{
			if($('#s1').is(":visible")){
				$('#s1').slideUp();$('#s2').slideUp();
				$('#down').removeClass().addClass('glyphicon glyphicon-chevron-down');
			} else{
				$('#s1').slideDown();$('#s2').slideDown();
				$('#down').removeClass().addClass('glyphicon glyphicon-chevron-up');
			}
		}
	});
	$('.switch').click(function(){
		if($('svg').is(":visible")){
			$('.switch').empty();
			$('.switch').append('<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>Wall Clock<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></div>');
			if($('#s3').is(":visible")){
				$('#s3').slideUp();$('#s4').slideUp();$('#s5').slideUp();$('#s6').slideUp();$('#s7').slideUp();
				$('#down').removeClass().addClass('glyphicon glyphicon-chevron-down');
			}
			$('svg').fadeOut(); $('.digital-mini').fadeOut(); $('.weekday').fadeOut();
			$('.digital').fadeIn();
		}else{
			$('.switch').empty();
			$('.switch').append('<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>Digital Clock<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span></div>');
			if($('#s1').is(":visible")){
				$('#s1').slideUp();$('#s2').slideUp();
				$('#down').removeClass().addClass('glyphicon glyphicon-chevron-down');
			}
			$('.digital').fadeOut();
			$('svg').fadeIn();
			if($('#date').prop('checked') == true)
				$('.digital-mini').fadeIn();
			if($('#weekday').prop('checked') == true)
				 $('.weekday').fadeIn();
		}
	});
	$('.number').click(function(){
		if(!($(this).is(":checked"))){
			$(this).prop('checked', true);
		}else{
			$('.number').prop('checked',false);
			$(this).prop('checked', true);
			console.log($(this).text());
			if($(this).attr('id') == "romanian"){
				ifRomanian = true;
			}else{
				ifRomanian = false;
			}
			drawClock(ifRomanian);
			$('.tick').prop('checked',true);
			$('.label1').prop('checked',true);
			$('.hand').prop('checked',true);
		}
	});
	$('.add').click(function(){
		if($(this).prop('checked') == true){
			if($(this).attr('id') == 'date'){
				$('.digital-mini').show();
			}else{
				$('.weekday').show();
			}
		}else{
			if($(this).attr('id') == 'date'){
				$('.digital-mini').hide();
			}else{
				$('.weekday').hide();
			}
		}
	});
	$('.timezone').change(function(){
		timezone = -$('.timezone option:selected').attr('id') + 1;
	});
});