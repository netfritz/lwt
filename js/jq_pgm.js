/**************************************************************
"Learning with Texts" (LWT) is released into the Public Domain.
This applies worldwide.
In case this is not legally possible, any entity is granted the
right to use this work for any purpose, without any conditions, 
unless such conditions are required by law.

Developed by J. P. in 2011, 2012, 2013.
***************************************************************/

/**************************************************************
Global variables used in LWT jQuery functions
***************************************************************/

var TEXTPOS = -1;
var OPENED = 0;
var WID = 0;
var TID = 0;
var WBLINK1 = '';
var WBLINK2 = '';
var WBLINK3 = '';
var SOLUTION = '';
var ADDFILTER = '';
var RTL = 0;
 
/**************************************************************
LWT jQuery functions
***************************************************************/

function getUTF8Length(string) {
	var utf8length = 0;
	for (var n = 0; n < string.length; n++) {
		var c = string.charCodeAt(n);
		if (c < 128) {
			utf8length++;
		}
		else if((c > 127) && (c < 2048)) {
			utf8length = utf8length+2;
		}
		else {
			utf8length = utf8length+3;
		}
	}
	return utf8length;
}

function scrollToAnchor(aid){
  document.location.href = '#' + aid;
}

function changeImprAnnText() {
	var textid = $('#editimprtextdata').attr('data_id');
	$(this).prev('input:radio').attr('checked', 'checked');
	var elem = $(this).attr('name');
	var thedata = JSON.stringify($('form').serializeObject());
	$.post('ajax_save_impr_text.php', { id: textid, elem: elem, data : thedata }
		, function(d) { 
				if(d != 'OK') 
					alert('Saving your changes failed, please reload page and try again!'); 
			} 
	);
}
 
function changeImprAnnRadio() {
	var textid = $('#editimprtextdata').attr('data_id');
	var elem = $(this).attr('name');
	var thedata = JSON.stringify($('form').serializeObject());
	$.post('ajax_save_impr_text.php', { id: textid, elem: elem, data : thedata }
		, function(d) { 
				if(d != 'OK') 
					alert('Saving your changes failed, please reload page and try again!'); 
			} 
	);
}

function addTermTranslation(wordid,txid,word,lang) {
	var thedata = $(txid).val().trim();
	var pagepos = $(document).scrollTop();
	if((thedata == '') || (thedata == '*')) {
		alert('Text Field is empty or = \'*\'!');
		return;
	}
	$.post('ajax_add_term_transl.php', { id: wordid, data : thedata, text: word, lang: lang }
		, function(d) { 
				if(d == '') {
					alert('Adding translation to term OR term creation failed, please reload page and try again!'); 
				} else {
					do_ajax_edit_impr_text(pagepos,d);
				}
			} 
	);
}
 
function check() {
	var count = 0;
	$('input.notempty').each( function(n) {
		if($(this).attr('value').trim()=='') count++; 
	} );
	$('textarea.notempty').each( function(n) {
		if($(this).val().trim()=='') count++; 
	} );
	$('select.notempty').each( function(n) {
		if($(this).val().trim()=='') count++; 
	} );
	if (count > 0) {
		alert('ERROR\n\n' + count + ' field(s) - marked with * - must not be empty!');
		return false;
	}
	count = 0;
	$('textarea.checklength').each( function(n) {
		if($(this).val().trim().length > (0 + $(this).attr('data_maxlength'))) {
			alert('ERROR\n\nText is too long in field "' + $(this).attr('data_info') + '", please make it shorter! (Maximum length: ' + $(this).attr('data_maxlength') + ' char.)');
			count++;
		}
	} );
	$('textarea.checkbytes').each( function(n) {
		if(getUTF8Length($(this).val().trim()) > (0 + $(this).attr('data_maxlength'))) {
			alert('ERROR\n\nText is too long in field "' + $(this).attr('data_info') + '", please make it shorter! (Maximum length: ' + $(this).attr('data_maxlength') + ' bytes.)');
			count++;
		}
	} );
	$('input.noblanksnocomma').each( function(n) {
		if($(this).val().indexOf(' ') > 0 || $(this).val().indexOf(',') > 0) {
			alert('ERROR\n\nNo spaces or commas allowed in field "' + $(this).attr('data_info') + '", please remove!');
			count++;
		}
	} );
	return (count == 0);
}

function markClick() {
	if($('input.markcheck:checked').length > 0) {
		$('#markaction').removeAttr('disabled');
	} else {
		$('#markaction').attr('disabled','disabled');
	}
}

function showallwordsClick() {
	var option = $('#showallwords:checked').length;
	var text = $('#thetextid').text();
	window.parent.frames['ro'].location.href = 
		'set_text_mode.php?mode=' + option +
		'&text=' + text;
}

function textareaKeydown(event) {
	if (event.keyCode && event.keyCode == '13') {
		if (check()) $('input:submit').last().click();
		return false;
	} else {
		return true;
	}
}

function noShowAfter3Secs() {
	$('#hide3').slideUp();
}

function setTheFocus() {
	$('.setfocus').focus().select();
}

function word_click_event_do_test_test() {
	run_overlib_test(
		WBLINK1, WBLINK2, WBLINK3, 
		$(this).attr('data_wid'),
		$(this).attr('data_text'),
		$(this).attr('data_trans'),
		$(this).attr('data_rom'),
		$(this).attr('data_status'),
		$(this).attr('data_sent'),
		$(this).attr('data_todo'));
	$('.todo').text(SOLUTION);
	return false;
}

function keydown_event_do_test_test(e) {
	if (e.which == 32 && OPENED == 0) {  // space : show sol.
		$('.word').click();
		cClick();
		window.parent.frames['ro'].location.href = 'show_word.php?wid=' + $('.word').attr('data_wid');
		OPENED = 1;
		return false;
	}
	if (OPENED == 0) return true;
	if (e.which == 38) {  // up : status+1
		window.parent.frames['ro'].location.href = 
			'set_test_status.php?wid=' + WID + '&stchange=1';
		return false;
	}
	if (e.which == 40) {  // down : status-1
		window.parent.frames['ro'].location.href = 
			'set_test_status.php?wid=' + WID + '&stchange=-1';
		return false;
	}
	if (e.which == 27) {  // esc : dont change status
		window.parent.frames['ro'].location.href = 
			'set_test_status.php?wid=' + WID + '&status=' + $('.word').attr('data_status');
		return false;
	}
	for (var i=1; i<=5; i++) {
		if (e.which == (48+i) || e.which == (96+i)) {  // 1,.. : status=i
			window.parent.frames['ro'].location.href = 
				'set_test_status.php?wid=' + WID + '&status=' + i;
			return false;
		}
	}
	if (e.which == 73) {  // I : status=98
		window.parent.frames['ro'].location.href = 
			'set_test_status.php?wid=' + WID + '&status=98';
		return false;
	}
	if (e.which == 87) {  // W : status=99
		window.parent.frames['ro'].location.href = 
			'set_test_status.php?wid=' + WID + '&status=99';
		return false;
	}
	if (e.which == 69) {  // E : EDIT
		window.parent.frames['ro'].location.href = 
			'edit_tword.php?wid=' + WID;
		return false;
	}
	return true;
}

function word_each_do_text_text(i) {
	this.title = make_tooltip($(this).text(), $(this).attr('data_trans'), 
		$(this).attr('data_rom'), $(this).attr('data_status'));
}

function mword_each_do_text_text(i) {
	if ($(this).attr('data_status') != '') 
		this.title = make_tooltip($(this).attr('data_text'), 
		$(this).attr('data_trans'), $(this).attr('data_rom'), 
		$(this).attr('data_status'));
}

function word_dblclick_event_do_text_text() {
	var t = parseInt($("#totalcharcount").text(),10);	
	if ( t == 0 ) return;
	var p = 100 * ($(this).attr('data_pos')-5) / t;
	if (p < 0) p = 0;
	if (typeof (window.parent.frames['h'].new_pos) == 'function')
		window.parent.frames['h'].new_pos(p);
}

function word_click_event_do_text_text() {
	var status = $(this).attr('data_status');
	if ( status < 1 ) {
		run_overlib_status_unknown(WBLINK1,WBLINK2,WBLINK3,$(this).attr('title'),
			TID,$(this).attr('data_order'),$(this).text(),$(this).attr('data_mw2'),
			$(this).attr('data_mw3'),$(this).attr('data_mw4'),$(this).attr('data_mw5'),
			$(this).attr('data_mw6'),$(this).attr('data_mw7'),$(this).attr('data_mw8'),
			$(this).attr('data_mw9'),RTL);
		top.frames['ro'].location.href='edit_word.php?tid=' + TID + '&ord=' + 
			$(this).attr('data_order') + '&wid=';
	}
	else if ( status == 99 )
		run_overlib_status_99(WBLINK1,WBLINK2,WBLINK3,$(this).attr('title'),
			TID,$(this).attr('data_order'),$(this).text(),$(this).attr('data_wid'),
			$(this).attr('data_mw2'),$(this).attr('data_mw3'),$(this).attr('data_mw4'),
			$(this).attr('data_mw5'),$(this).attr('data_mw6'),$(this).attr('data_mw7'),
			$(this).attr('data_mw8'),$(this).attr('data_mw9'),RTL);
	else if ( status == 98 )
		run_overlib_status_98(WBLINK1,WBLINK2,WBLINK3,$(this).attr('title'),
			TID,$(this).attr('data_order'),$(this).text(),$(this).attr('data_wid'),
			$(this).attr('data_mw2'),$(this).attr('data_mw3'),$(this).attr('data_mw4'),
			$(this).attr('data_mw5'),$(this).attr('data_mw6'),$(this).attr('data_mw7'),
			$(this).attr('data_mw8'),$(this).attr('data_mw9'),RTL);
	else
		run_overlib_status_1_to_5(WBLINK1,WBLINK2,WBLINK3,$(this).attr('title'),
			TID,$(this).attr('data_order'),$(this).text(),$(this).attr('data_wid'),status,
			$(this).attr('data_mw2'),$(this).attr('data_mw3'),$(this).attr('data_mw4'),
			$(this).attr('data_mw5'),$(this).attr('data_mw6'),$(this).attr('data_mw7'),
			$(this).attr('data_mw8'),$(this).attr('data_mw9'),RTL);
	return false;
}
	
function mword_click_event_do_text_text() {
	var status = $(this).attr('data_status');
	if (status != '') 
		run_overlib_multiword(WBLINK1,WBLINK2,WBLINK3,$(this).attr('title'),TID,
		$(this).attr('data_order'),$(this).attr('data_text'),$(this).attr('data_wid'),
		status,$(this).attr('data_code'));
	return false;
}

function keydown_event_do_text_text(e) {

	if (e.which == 27) {  // esc = reset all
		TEXTPOS = -1;
		$('span.uwordmarked').removeClass('uwordmarked');
		$('span.kwordmarked').removeClass('kwordmarked');
		cClick();
		return false;
	}
	
	if (e.which == 13) {  // return = edit next unknown word
		$('span.uwordmarked').removeClass('uwordmarked');
		var unknownwordlist = $('span.status0.word:not(.hide):first');
		if (unknownwordlist.size() == 0) return false;
		$(window).scrollTo(unknownwordlist,{axis:'y', offset:-150});
		unknownwordlist.addClass('uwordmarked').click();
		cClick();
		return false;
	}
	
	var knownwordlist = $('span.word:not(.hide):not(.status0)' + ADDFILTER + ',span.mword:not(.hide)' + ADDFILTER);
	var l_knownwordlist = knownwordlist.size();
	if (l_knownwordlist == 0) return true;
	
	// the following only for a non-zero known words list
	if (e.which == 36) {  // home : known word navigation -> first
		$('span.kwordmarked').removeClass('kwordmarked');
		TEXTPOS = 0;
		curr = knownwordlist.eq(TEXTPOS);
		curr.addClass('kwordmarked');
		$(window).scrollTo(curr,{axis:'y', offset:-150});
		window.parent.frames['ro'].location.href = 'show_word.php?wid=' + curr.attr('data_wid');
		return false;
	}
	if (e.which == 35) {  // end : known word navigation -> last
		$('span.kwordmarked').removeClass('kwordmarked');
		TEXTPOS = l_knownwordlist-1;
		curr = knownwordlist.eq(TEXTPOS);
		curr.addClass('kwordmarked');
		$(window).scrollTo(curr,{axis:'y', offset:-150});
		window.parent.frames['ro'].location.href = 'show_word.php?wid=' + curr.attr('data_wid');
		return false;
	}
	if (e.which == 37) {  // left : known word navigation
		$('span.kwordmarked').removeClass('kwordmarked');
		TEXTPOS--;
		if (TEXTPOS < 0) TEXTPOS = l_knownwordlist - 1;
		curr = knownwordlist.eq(TEXTPOS);
		curr.addClass('kwordmarked');
		$(window).scrollTo(curr,{axis:'y', offset:-150});
		window.parent.frames['ro'].location.href = 'show_word.php?wid=' + curr.attr('data_wid');
		return false;
	}
	if (e.which == 39 || e.which == 32) {  // space /right : known word navigation
		$('span.kwordmarked').removeClass('kwordmarked');
		TEXTPOS++;
		if (TEXTPOS >= l_knownwordlist) TEXTPOS = 0;
		curr = knownwordlist.eq(TEXTPOS);
		curr.addClass('kwordmarked');
		$(window).scrollTo(curr,{axis:'y', offset:-150});
		window.parent.frames['ro'].location.href = 'show_word.php?wid=' + curr.attr('data_wid');
;
		return false;
	}

	if (TEXTPOS < 0 || TEXTPOS >= l_knownwordlist) return true;
	var curr = knownwordlist.eq(TEXTPOS);
	var wid = curr.attr('data_wid');
	var ord = curr.attr('data_order');
	
	// the following only with valid pos.
	for (var i=1; i<=5; i++) {
		if (e.which == (48+i) || e.which == (96+i)) {  // 1,.. : status=i
			window.parent.frames['ro'].location.href = 
				'set_word_status.php?wid=' + wid + '&tid=' + TID + '&ord=' + ord + '&status=' + i;
			return false;
		}
	}
	if (e.which == 73) {  // I : status=98
		window.parent.frames['ro'].location.href = 
			'set_word_status.php?wid=' + wid + '&tid=' + TID + '&ord=' + ord + '&status=98';
		return false;
	}
	if (e.which == 87) {  // W : status=99
		window.parent.frames['ro'].location.href = 
			'set_word_status.php?wid=' + wid + '&tid=' + TID + '&ord=' + ord + '&status=99';
		return false;
	}
	if (e.which == 65) {  // A : set audio pos.
		var p = curr.attr('data_pos');
		var t = parseInt($("#totalcharcount").text(),10);	
		if ( t == 0 ) return true;
		p = 100 * (p-5) / t;
		if (p < 0) p = 0;
		if (typeof (window.parent.frames['h'].new_pos) == 'function')
			window.parent.frames['h'].new_pos(p);
		else 
			return true;
		return false;
	}
	if (e.which == 69) { //  E : EDIT
		if(curr.has('.mword'))
			window.parent.frames['ro'].location.href = 
				'edit_mword.php?wid=' + wid + '&tid=' + TID + '&ord=' + ord;
		else {
			window.parent.frames['ro'].location.href = 
				'edit_word.php?wid=' + wid + '&tid=' + TID + '&ord=' + ord;
		}
		return false;
	}

	return true;
}

function do_ajax_save_setting(k, v) {
	$.post('ajax_save_setting.php', { k: k, v: v } );
}

function do_ajax_update_media_select() {
	$('#mediaselect').html('&nbsp; <img src="icn/waiting2.gif" />');
	$.post('ajax_update_media_select.php', 
		function(data) { $('#mediaselect').html(data); } 
	);
}

function do_ajax_show_sentences(lang,word,ctl) {
	$('#exsent').html('<img src="icn/waiting2.gif" />');
	$.post('ajax_show_sentences.php', { lang: lang, word: word, ctl: ctl }, 
		function(data) { $('#exsent').html(data); } 
	);
}

function do_ajax_word_counts() {
	$("span[id^='saved-']").each(
		function(i) {
			var textid = $(this).attr('data_id');
			$(this).html('<img src="icn/waiting2.gif" />');
			$.post('ajax_word_counts.php', { id: textid },
				function(data) { 
					var res = eval('(' + data + ')');
					$('#total-'+textid).html(res[0]);
					$('#saved-'+textid).html(res[1]);
					$('#todo-'+textid).html(res[2]);
					$('#todop-'+textid).html(res[3]);
				}
			);
		}
	);
}

function do_ajax_edit_impr_text(pagepos, word) {
	if (word=='') $('#editimprtextdata').html('<img src="icn/waiting2.gif" />');
	var textid = $('#editimprtextdata').attr('data_id');
	$.post('ajax_edit_impr_text.php', { id: textid, word: word }, 
		function(data) {
			// alert(data);
			eval(data);
			$.scrollTo(pagepos); 
			$('input.impr-ann-text').change(changeImprAnnText);
			$('input.impr-ann-radio').change(changeImprAnnRadio);
		} 
	);
}

$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

$(document).ready( function() {
	$('.edit_area').editable('inline_edit.php', 
		{ 
			type      : 'textarea',
			indicator : '<img src="icn/indicator.gif">',
			tooltip   : 'Click to edit...',
			submit    : 'Save',
			cancel    : 'Cancel',
			rows      : 3,
			cols      : 35
		}
	);
	$('input.impr-ann-text').change(changeImprAnnText);
	$('input.impr-ann-radio').change(changeImprAnnRadio);
	$('form.validate').submit(check);
	$('input.markcheck').click(markClick);
	$('#showallwords').click(showallwordsClick);
	$('textarea.textarea-noreturn').keydown(textareaKeydown);
	$('#termtags').tagit({tagSource: TAGS, itemName: 'TermTags', fieldName: 'TagList'});
	$('#texttags').tagit({tagSource: TEXTTAGS, itemName: 'TextTags', fieldName: 'TagList'});
	markClick();
	setTheFocus();
	window.setTimeout(noShowAfter3Secs,3000);
} ); 
