<?php

/**************************************************************
"Learning with Texts" (LWT) is released into the Public Domain.
This applies worldwide.
In case this is not legally possible, any entity is granted the
right to use this work for any purpose, without any conditions, 
unless such conditions are required by law.

Developed by J. P. in 2011, 2012, 2013.
***************************************************************/

/**************************************************************
Call: ajax_edit_impr_text.php?id=[textid]
Display table for Improved Annotation (Edit Mode), 
Ajax call in print_impr_text.php
***************************************************************/

include "connect.inc.php";
include "settings.inc.php";
include "utilities.inc.php";

function make_trans($i, $wid, $trans, $word, $lang) {
	$trans = trim($trans);
	$widset = is_numeric($wid);
	if ($widset) {
		$alltrans = get_first_value("select WoTranslation as value from words where WoID = " . $wid);
		$transarr = preg_split('/[' . get_sepas()  . ']/u', $alltrans);
		$r = "";
		$set = false;
		foreach ($transarr as $t) {
			$tt = trim($t);
			if (($tt == '*') || ($tt == '')) continue;
			if ((! $set) && ($tt == $trans)) {
				$set = true;
				$r .= '<span class="nowrap"><input class="impr-ann-radio" checked="checked" type="radio" name="rg' . $i . '" value="' . tohtml($tt) . '" />&nbsp;' . tohtml($tt) . '</span> <br /> ';
			} else {
				$r .= '<span class="nowrap"><input class="impr-ann-radio" type="radio" name="rg' . $i . '" value="' . tohtml($tt) . '" />&nbsp;' . tohtml($tt) . '</span>  <br />  ';
			}
		}
		if (! $set) {
			$r .= '<span class="nowrap"><input class="impr-ann-radio" checked="checked" type="radio" name="rg' . $i . '" value="" />&nbsp;<input class="impr-ann-text" type="text" name="tx' . $i . '" id="tx' . $i . '" value="' . tohtml($trans) . '" maxlength="50" size="40" />';
		} else {
			$r .= '<span class="nowrap"><input class="impr-ann-radio" type="radio" name="rg' . $i . '" value="" />&nbsp;<input class="impr-ann-text" type="text" name="tx' . $i . '" id="tx' . $i . '" value="" maxlength="50" size="40" />';
		}
	} else {
		$r = '<span class="nowrap"><input checked="checked" type="radio" name="rg' . $i . '" value="" />&nbsp;<input class="impr-ann-text" type="text" name="tx' . $i . '" id="tx' . $i . '" value="' . tohtml($trans) . '" maxlength="50" size="40" />';
	}
	$r .= ' &nbsp;<img class="click" src="icn/eraser.png" title="Erase Text Field" alt="Erase Text Field" onclick="$(\'#tx' . $i . '\').val(\'\').trigger(\'change\');" />';
	$r .= ' &nbsp;<img class="click" src="icn/star.png" title="* (Set to Term)" alt="* (Set to Term)" onclick="$(\'#tx' . $i . '\').val(\'*\').trigger(\'change\');" />';
	if ($widset)
		$r .= ' &nbsp;<img class="click" src="icn/plus-button.png" title="Save another translation to existent term" alt="Save another translation to existent term" onclick="addTermTranslation(' . $wid . ', \'#tx' . $i . '\',\'\',' . $lang . ');" />';
	else 
		$r .= ' &nbsp;<img class="click" src="icn/plus-button.png" title="Save translation to new term" alt="Save translation to new term" onclick="addTermTranslation(0, \'#tx' . $i . '\',' . prepare_textdata_js($word) . ',' . $lang . ');" />';
	$r .= '</span>';
	return $r;
}

$textid = $_POST["id"] + 0;
$wordlc = stripTheSlashesIfNeeded($_POST['word']);

$sql = 'select TxLgID, TxTitle from texts where TxID = ' . $textid;
$res = mysql_query($sql);		
if ($res == FALSE) die("Invalid Query: $sql");
$record = mysql_fetch_assoc($res);
$title = $record['TxTitle'];
$langid = $record['TxLgID'];
mysql_free_result($res);

$sql = 'select LgTextSize, LgRightToLeft from languages where LgID = ' . $langid;
$res = mysql_query($sql);		
if ($res == FALSE) die("Invalid Query: $sql");
$record = mysql_fetch_assoc($res);
$textsize = $record['LgTextSize'] + 0;
if ($textsize > 100) $textsize = intval($textsize * 0.8);
$rtlScript = $record['LgRightToLeft'];
mysql_free_result($res);

$ann = get_first_value("select TxAnnotatedText as value from texts where TxID = " . $textid);
$ann_exists = (strlen($ann) > 0);
if ($ann_exists) {
	$ann = recreate_save_ann($textid, $ann);
	$ann_exists = (strlen($ann) > 0);
}

$rr = "";
$r = "";
$r .= '<form action="" method="post"><table class="tab1" cellspacing="0" cellpadding="5"><tr>';
$r .= '<th class="th1 center">Text</th>';
$r .= '<th class="th1 center">Dict.</th>';
$r .= '<th class="th1 center">Edit<br />Term</th>';
$r .= '<th class="th1 center">Term Translations (Delim.: ' . tohtml(getSettingWithDefault('set-term-translation-delimiters')) . ')<br /><input type="button" value="Reload" onclick="do_ajax_edit_impr_text(0,\'\');" /></th>';
$r .= '</tr>';
$nonterms = "";
$items = preg_split('/[\n]/u', $ann);
$i = 0;
$nontermbuffer ='';
foreach ($items as $item) {
	$i++;
	$vals = preg_split('/[\t]/u', $item);
	if ($vals[0] > -1) {
		if ($nontermbuffer != '') {
			$r .= '<tr><td class="td1 center" style="font-size:' . $textsize . '%;">';
			$r .= $nontermbuffer; 
			$r .= '</td><td class="td1 right" colspan="3"><img class="click" src="icn/tick.png" title="Back to \'Display/Print Mode\'" alt="Back to \'Display/Print Mode\'" onclick="location.href=\'print_impr_text.php?text=' . $textid . '\';" /></td></tr>';
			$nontermbuffer ='';
		}
		$id = '';
		$trans = '';
		if (count($vals) > 2) {
			$id = $vals[2];
			if (is_numeric($id)) {
				if(get_first_value("select count(WoID) as value from words where WoID = "
				 . $id) < 1) $id = '';
			}
		}
		if (count($vals) > 3) $trans = $vals[3];
		$r .= '<tr><td class="td1 center" style="font-size:' . $textsize . '%;"' . 
			($rtlScript ? ' dir="rtl"' : '') . '><span id="term' . $i . '">';
		$r .= tohtml($vals[1]);
		$mustredo = (trim($wordlc) == mb_strtolower(trim($vals[1]), 'UTF-8'));
		$r .= '</span></td><td class="td1 center" nowrap="nowrap">';
		$r .= makeDictLinks($langid,prepare_textdata_js($vals[1]));
		$r .= '</td><td class="td1 center"><span id="editlink' . $i . '">';
		/***** editlink + $i ******/
		if ($id == '') {
			$plus = '&nbsp;';
		} else {
			$plus = '<a name="rec' . $i . '"></a><span class="click" onclick="oewin(\'edit_word.php?fromAnn=\' + $(document).scrollTop() + \'&amp;wid=' . $id . '\');"><img src="icn/sticky-note--pencil.png" title="Edit Term" alt="Edit Term" /></span>';
		}
		if ($mustredo) $rr .= "$('#editlink" . $i . "').html(" . prepare_textdata_js($plus) . ");";
		$r .= $plus;
		/***** END editlink + $i ******/
		$r .= '</span></td><td class="td1" style="font-size:90%;"><span id="transsel' . $i . '">';
		/***** transsel + $i ******/
		$plus = make_trans($i, $id, $trans, $vals[1], $langid);
		if ($mustredo) $rr .= "$('#transsel" . $i . "').html(" . prepare_textdata_js($plus) . ");";
		$r .= $plus;
		/***** END transsel + $i ******/
		$r .= '</span></td></tr>';
	} else {
		if (trim($vals[1]) != '') {
			$nontermbuffer .= str_replace("¶", '<img src="icn/new_line.png" title="New Line" alt="New Line" />', tohtml($vals[1])); 
		}
	}
}
if ($nontermbuffer != '') {
	$r .= '<tr><td class="td1 center" style="font-size:' . $textsize . '%;">';
	$r .= $nontermbuffer; 
	$r .= '</td><td class="td1 right" colspan="3"><img class="click" src="icn/tick.png" title="Back to \'Display/Print Mode\'" alt="Back to \'Display/Print Mode\'" onclick="location.href=\'print_impr_text.php?text=' . $textid . '\';" /></td></tr>';
}
$r .= '<th class="th1 center">Text</th>';
$r .= '<th class="th1 center">Dict.</th>';
$r .= '<th class="th1 center">Edit<br />Term</th>';
$r .= '<th class="th1 center">Term Translations (Delim.: ' . tohtml(getSettingWithDefault('set-term-translation-delimiters')) . ')<br /><input type="button" value="Reload" onclick="do_ajax_edit_impr_text(1e6,\'\');" /><a name="bottom"></a></th>';
$r .= '</tr></table></form>' . "\n";
/*
$r .= '<script type="text/javascript">' . "\n";
$r .= '//<![CDATA[' . "\n";
$r .= '$(document).ready( function() {' . "\n";
$r .= "$('input.impr-ann-text').change(changeImprAnnText);\n";
$r .= "$('input.impr-ann-radio').change(changeImprAnnRadio);\n";
$r .= '} );' . "\n";
$r .= '//]]>' . "\n";
$r .= '</script>' . "\n";
*/

if ($wordlc == '')
	echo "$('#editimprtextdata').html(" . prepare_textdata_js($r) . ");";
else
	echo $rr;

?>
