var limitMun = '14002'; //getKvpParameterValue("municipio");
var url="http://www.juntadeandalucia.es/sandetel/publicacion/semanasanta/SemanaSantaAction?action=getDirList&municipio=" + limitMun;

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
	document.addEventListener("backbutton", onBackButton, false);
}
function onBackButton(){
	navigator.app.exitApp();
}

var objDirTree;
$(document).on("pageshow", function(){ ScaleContentToDevice(); });
$( document ).ready(function() {
	var codmunStoraged = localStorage.getItem('codmun'); 
	var diaStoraged = localStorage.getItem('dia');
	if(codmunStoraged===null && diaStoraged ===null){ 
		window.location.hash = 'seleccion';
	}else{
		window.location.hash = 'mapa';
	}
	$.mobile.initializePage();
	//$('select').selectmenu();
	
	$.getJSON(url, function( data ) {
		objDirTree = data;
		$("#dropMunicipios").empty();
		$.each(objDirTree.municipios, function (index, value) {
		    $("#dropMunicipios").append('<option value="'+value.codmun+'">'+value.nombre+'</option>');
		});
		$("#dropMunicipios>option").tsort({charOrder:'a[á]c{ch}e[é]i[í]l{ll}nño[ó]u[ú]y[ý]'});
		
		
		if(codmunStoraged===null && diaStoraged===null){ 
			//no hay datos almacenados
			cargarDias($("#dropMunicipios").val());
			cargarProcesiones($('#dropMunicipios').val(),$('#dropDias').val());
		}else{
			//console.log(codmunStoraged + "," + diaStoraged);
			cargarDias(codmunStoraged);
			$("#dropMunicipios").val(codmunStoraged);
			$("#dropDias").val(diaStoraged).selectmenu("refresh");
			cargarProcesiones(codmunStoraged,diaStoraged);
			setIframeSrc($("#dropProcesiones").val());
		}
		$("#dropMunicipios").selectmenu().selectmenu("refresh");
		
		
		setText($("#dropMunicipios").val());
		asociarEventos();
				
		
		if(limitMun != ""){
			$("#groupMunicipios").css('display','none');
		}
		//quitar splash
		cordova.exec(null, null, "SplashScreen", "hide", []);
	});
});

function asociarEventos(){
	
	$('#dropMunicipios').change(function(e){
		//e.preventDefault();
		//e.stopImmediatePropagation();
		setText($(this).val());
		cargarDias($(this).val());
	});
	$('#dropDias').change(function(e){
		//e.preventDefault();
		//e.stopImmediatePropagation();
	});
	$('#dropProcesiones').change(function(e){
		//e.preventDefault();
		//e.stopImmediatePropagation();
		startLoadUrl();
		setIframeSrc($(this).val());
		setTimeout(function(){stopLoadUrl();},3000); //3s de carga aproximada.		
	});
	$('#btnMapa').click(function(e){
		//e.preventDefault();
		//e.stopImmediatePropagation();
		localStorage.setItem('codmun',$('#dropMunicipios').val());
		localStorage.setItem('dia',$('#dropDias').val());
		cargarProcesiones($('#dropMunicipios').val(), $('#dropDias').val());
		setIframeSrc($("#dropProcesiones").val());
		startLoadUrl();
		setTimeout(function(){$.mobile.changePage("#mapa");stopLoadUrl();},3000); //3s de carga aproximada.	
		
	});
	$('#btnVolver').click(function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		$.mobile.changePage("#seleccion");
	});
		
	$(window).on('resize orientationchange', function(){ ScaleContentToDevice(); });
}

function getPosOfDay(dayName){
	dayName = dayName.toLowerCase();
	if (dayName.indexOf("domingo")<0 && dayName.indexOf(" ")>0){
		dayName = dayName.split(" ")[0];
	}
	console.log(dayName);
	switch(dayName)
	{
		case "domingo de ramos":
		  return 0;	
		case "lunes":
		  return 1;
		case "martes":
		  return 2;
		case "miércoles":
		  return 3;
		case "jueves":
		  return 4;
		case "madrugá":
		case "madrugada":
		  return 4.5;
		case "viernes":
		  return 5;
		case "sábado":
		  return 6;
		case "domingo de resurrección":
		  return 7;
		default:
		  return -1;
	} 
}

function cargarDias(municipioSel){
	$("#dropDias").empty();
	$.each(objDirTree.municipios, function (index, value) {
	    if ($(this)[0].codmun==municipioSel){
	    	$.each($(this)[0].dias, function (index, value){
	    		$("#dropDias").append('<option value="'+value.dia+'">'+value.dia+'</option>');
	    	});
	    }
	});
	$("#dropDias").html($('#dropDias option').sort(function(x, y) {
        return getPosOfDay($(x).text()) < getPosOfDay($(y).text()) ? -1 : 1;
	})).selectmenu().selectmenu("refresh");	
}
function cargarProcesiones(municipio, dia){
	$("#dropProcesiones").empty();
	$.each(objDirTree.municipios, function (index, value) {
	    if ($(this)[0].codmun==municipio){
	    	$.each($(this)[0].dias, function (index, value){
	    		if ($(this)[0].dia==dia){
	    			$.each($(this)[0].procesiones, function (index, value){
	    				$("#dropProcesiones").append('<option value="'+value.url+'">'+value.nombre+'</option>');
	    			});
	    		
	    		}
	    	});
	    }
	});
	/*$("#dropProcesiones").html($('#dropProcesiones option').sort(function(x, y) {
        return $(x).text() < $(y).text() ? -1 : 1;
	})).selectmenu().selectmenu("refresh");*/
	$("#dropProcesiones>option").tsort({charOrder:'a[á]c{ch}e[é]i[í]l{ll}nño[ó]u[ú]y[ý]'});
	$("#dropProcesiones").selectmenu().selectmenu("refresh");
}
function setText(municipioSel){
	$.each(objDirTree.municipios, function (index, value) {
	    if ($(this)[0].codmun==municipioSel){
	    	$("#txtMunicipio").html(value.texto);
	    }
	});
}

function setIframeSrc(url){
	//console.log(url);
	$("#mapea").attr("src",url);
}
function startLoadUrl(){
	navigator.notification.activityStart("Cargando...", "Espere mientras carga el mapa");
}
function stopLoadUrl(){
	navigator.notification.activityStop();
}
function ScaleContentToDevice() {
	   scroll(0, 0);
	   
	   var headerHeight = $(".ui-header:visible").outerHeight();
	   var footerHeight = $(".ui-footer:visible").outerHeight();
	   var content = $(".ui-content:visible");

	   var viewportHeight = $(window).height();
	   var contentMargins =  content.outerHeight() - content.height();
	   var contentheight = viewportHeight - headerHeight - footerHeight - contentMargins;

	   content.height(contentheight);
}
function getKvpParameterValue(name)
{
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var results = new RegExp('[\\?&]' + name + '=([^&#]*)', 'i').exec(window.location.href);
	if(results==null)
	{
		return "";
	}
	else
	{
		//return results[1];
		return decodeURIComponent(results[1]);
	}
}
	

