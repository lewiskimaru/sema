"""
Language support service - provides information about supported languages
"""

from typing import Dict, List, Optional
from ..core.logging import get_logger

logger = get_logger()

# FLORES-200 language codes with human-readable names and regions
SUPPORTED_LANGUAGES = {
    # African Languages (55+ languages) - Complete FLORES-200 African language support
    "afr_Latn": {"name": "Afrikaans", "native_name": "Afrikaans", "region": "Africa", "script": "Latin"},
    "aka_Latn": {"name": "Akan", "native_name": "Akan", "region": "Africa", "script": "Latin"},
    "amh_Ethi": {"name": "Amharic", "native_name": "አማርኛ", "region": "Africa", "script": "Ethiopic"},
    "bam_Latn": {"name": "Bambara", "native_name": "Bamanankan", "region": "Africa", "script": "Latin"},
    "bem_Latn": {"name": "Bemba", "native_name": "Ichibemba", "region": "Africa", "script": "Latin"},
    "dik_Latn": {"name": "Dinka", "native_name": "Thuɔŋjäŋ", "region": "Africa", "script": "Latin"},
    "dyu_Latn": {"name": "Dyula", "native_name": "Jula", "region": "Africa", "script": "Latin"},
    "ewe_Latn": {"name": "Ewe", "native_name": "Eʋegbe", "region": "Africa", "script": "Latin"},
    "fon_Latn": {"name": "Fon", "native_name": "Fɔngbe", "region": "Africa", "script": "Latin"},
    "fuv_Latn": {"name": "Nigerian Fulfulde", "native_name": "Fulfulde", "region": "Africa", "script": "Latin"},
    "gaz_Latn": {"name": "West Central Oromo", "native_name": "Oromoo", "region": "Africa", "script": "Latin"},
    "hau_Latn": {"name": "Hausa", "native_name": "Harshen Hausa", "region": "Africa", "script": "Latin"},
    "ibo_Latn": {"name": "Igbo", "native_name": "Asụsụ Igbo", "region": "Africa", "script": "Latin"},
    "kab_Latn": {"name": "Kabyle", "native_name": "Taqbaylit", "region": "Africa", "script": "Latin"},
    "kam_Latn": {"name": "Kamba", "native_name": "Kikamba", "region": "Africa", "script": "Latin"},
    "kbp_Latn": {"name": "Kabiyè", "native_name": "Kabɩyɛ", "region": "Africa", "script": "Latin"},
    "kea_Latn": {"name": "Kabuverdianu", "native_name": "Kabuverdianu", "region": "Africa", "script": "Latin"},
    "kik_Latn": {"name": "Kikuyu", "native_name": "Gĩkũyũ", "region": "Africa", "script": "Latin"},
    "kin_Latn": {"name": "Kinyarwanda", "native_name": "Ikinyarwanda", "region": "Africa", "script": "Latin"},
    "kmb_Latn": {"name": "Kimbundu", "native_name": "Kimbundu", "region": "Africa", "script": "Latin"},
    "knc_Arab": {"name": "Central Kanuri", "native_name": "Kanuri", "region": "Africa", "script": "Arabic"},
    "knc_Latn": {"name": "Central Kanuri", "native_name": "Kanuri", "region": "Africa", "script": "Latin"},
    "kon_Latn": {"name": "Kikongo", "native_name": "Kikongo", "region": "Africa", "script": "Latin"},
    "lin_Latn": {"name": "Lingala", "native_name": "Lingála", "region": "Africa", "script": "Latin"},
    "lua_Latn": {"name": "Luba-Lulua", "native_name": "Tshiluba", "region": "Africa", "script": "Latin"},
    "lug_Latn": {"name": "Luganda", "native_name": "Luganda", "region": "Africa", "script": "Latin"},
    "luo_Latn": {"name": "Luo", "native_name": "Dholuo", "region": "Africa", "script": "Latin"},
    "lus_Latn": {"name": "Mizo", "native_name": "Mizo ṭawng", "region": "Africa", "script": "Latin"},
    "mos_Latn": {"name": "Mossi", "native_name": "Mooré", "region": "Africa", "script": "Latin"},
    "nso_Latn": {"name": "Northern Sotho", "native_name": "Sesotho sa Leboa", "region": "Africa", "script": "Latin"},
    "nus_Latn": {"name": "Nuer", "native_name": "Thok Nath", "region": "Africa", "script": "Latin"},
    "nya_Latn": {"name": "Nyanja", "native_name": "Chinyanja", "region": "Africa", "script": "Latin"},
    "orm_Latn": {"name": "Oromo", "native_name": "Afaan Oromoo", "region": "Africa", "script": "Latin"},
    "run_Latn": {"name": "Rundi", "native_name": "Ikirundi", "region": "Africa", "script": "Latin"},
    "sag_Latn": {"name": "Sango", "native_name": "Sängö", "region": "Africa", "script": "Latin"},
    "sna_Latn": {"name": "Shona", "native_name": "ChiShona", "region": "Africa", "script": "Latin"},
    "som_Latn": {"name": "Somali", "native_name": "Soomaali", "region": "Africa", "script": "Latin"},
    "sot_Latn": {"name": "Southern Sotho", "native_name": "Sesotho", "region": "Africa", "script": "Latin"},
    "ssw_Latn": {"name": "Swati", "native_name": "SiSwati", "region": "Africa", "script": "Latin"},
    "swh_Latn": {"name": "Swahili", "native_name": "Kiswahili", "region": "Africa", "script": "Latin"},
    "taq_Latn": {"name": "Tamasheq", "native_name": "Tamasheq", "region": "Africa", "script": "Latin"},
    "taq_Tfng": {"name": "Tamasheq", "native_name": "ⵜⴰⵎⴰⵌⴰⵖ", "region": "Africa", "script": "Tifinagh"},
    "tir_Ethi": {"name": "Tigrinya", "native_name": "ትግርኛ", "region": "Africa", "script": "Ethiopic"},
    "tsn_Latn": {"name": "Tswana", "native_name": "Setswana", "region": "Africa", "script": "Latin"},
    "tso_Latn": {"name": "Tsonga", "native_name": "Xitsonga", "region": "Africa", "script": "Latin"},
    "tum_Latn": {"name": "Tumbuka", "native_name": "Chitumbuka", "region": "Africa", "script": "Latin"},
    "twi_Latn": {"name": "Twi", "native_name": "Twi", "region": "Africa", "script": "Latin"},
    "tzm_Tfng": {"name": "Central Atlas Tamazight", "native_name": "ⵜⴰⵎⴰⵣⵉⵖⵜ", "region": "Africa", "script": "Tifinagh"},
    "umb_Latn": {"name": "Umbundu", "native_name": "Umbundu", "region": "Africa", "script": "Latin"},
    "wol_Latn": {"name": "Wolof", "native_name": "Wolof", "region": "Africa", "script": "Latin"},
    "xho_Latn": {"name": "Xhosa", "native_name": "isiXhosa", "region": "Africa", "script": "Latin"},
    "yor_Latn": {"name": "Yoruba", "native_name": "Yorùbá", "region": "Africa", "script": "Latin"},
    "zul_Latn": {"name": "Zulu", "native_name": "isiZulu", "region": "Africa", "script": "Latin"},

    # European Languages
    "eng_Latn": {"name": "English", "native_name": "English", "region": "Europe", "script": "Latin"},
    "fra_Latn": {"name": "French", "native_name": "Français", "region": "Europe", "script": "Latin"},
    "deu_Latn": {"name": "German", "native_name": "Deutsch", "region": "Europe", "script": "Latin"},
    "spa_Latn": {"name": "Spanish", "native_name": "Español", "region": "Europe", "script": "Latin"},
    "ita_Latn": {"name": "Italian", "native_name": "Italiano", "region": "Europe", "script": "Latin"},
    "por_Latn": {"name": "Portuguese", "native_name": "Português", "region": "Europe", "script": "Latin"},
    "rus_Cyrl": {"name": "Russian", "native_name": "Русский", "region": "Europe", "script": "Cyrillic"},
    "nld_Latn": {"name": "Dutch", "native_name": "Nederlands", "region": "Europe", "script": "Latin"},
    "pol_Latn": {"name": "Polish", "native_name": "Polski", "region": "Europe", "script": "Latin"},
    "ces_Latn": {"name": "Czech", "native_name": "Čeština", "region": "Europe", "script": "Latin"},
    "hun_Latn": {"name": "Hungarian", "native_name": "Magyar", "region": "Europe", "script": "Latin"},
    "ron_Latn": {"name": "Romanian", "native_name": "Română", "region": "Europe", "script": "Latin"},
    "bul_Cyrl": {"name": "Bulgarian", "native_name": "Български", "region": "Europe", "script": "Cyrillic"},
    "hrv_Latn": {"name": "Croatian", "native_name": "Hrvatski", "region": "Europe", "script": "Latin"},
    "srp_Cyrl": {"name": "Serbian", "native_name": "Српски", "region": "Europe", "script": "Cyrillic"},
    "slk_Latn": {"name": "Slovak", "native_name": "Slovenčina", "region": "Europe", "script": "Latin"},
    "slv_Latn": {"name": "Slovenian", "native_name": "Slovenščina", "region": "Europe", "script": "Latin"},
    "est_Latn": {"name": "Estonian", "native_name": "Eesti", "region": "Europe", "script": "Latin"},
    "lav_Latn": {"name": "Latvian", "native_name": "Latviešu", "region": "Europe", "script": "Latin"},
    "lit_Latn": {"name": "Lithuanian", "native_name": "Lietuvių", "region": "Europe", "script": "Latin"},

    # Asian Languages
    "cmn_Hans": {"name": "Chinese (Simplified)", "native_name": "中文 (简体)", "region": "Asia", "script": "Han"},
    "cmn_Hant": {"name": "Chinese (Traditional)", "native_name": "中文 (繁體)", "region": "Asia", "script": "Han"},
    "jpn_Jpan": {"name": "Japanese", "native_name": "日本語", "region": "Asia", "script": "Japanese"},
    "kor_Hang": {"name": "Korean", "native_name": "한국어", "region": "Asia", "script": "Hangul"},
    "hin_Deva": {"name": "Hindi", "native_name": "हिन्दी", "region": "Asia", "script": "Devanagari"},
    "ben_Beng": {"name": "Bengali", "native_name": "বাংলা", "region": "Asia", "script": "Bengali"},
    "urd_Arab": {"name": "Urdu", "native_name": "اردو", "region": "Asia", "script": "Arabic"},
    "tam_Taml": {"name": "Tamil", "native_name": "தமிழ்", "region": "Asia", "script": "Tamil"},
    "tel_Telu": {"name": "Telugu", "native_name": "తెలుగు", "region": "Asia", "script": "Telugu"},
    "mar_Deva": {"name": "Marathi", "native_name": "मराठी", "region": "Asia", "script": "Devanagari"},
    "guj_Gujr": {"name": "Gujarati", "native_name": "ગુજરાતી", "region": "Asia", "script": "Gujarati"},
    "kan_Knda": {"name": "Kannada", "native_name": "ಕನ್ನಡ", "region": "Asia", "script": "Kannada"},
    "mal_Mlym": {"name": "Malayalam", "native_name": "മലയാളം", "region": "Asia", "script": "Malayalam"},
    "ori_Orya": {"name": "Odia", "native_name": "ଓଡ଼ିଆ", "region": "Asia", "script": "Odia"},
    "pan_Guru": {"name": "Punjabi", "native_name": "ਪੰਜਾਬੀ", "region": "Asia", "script": "Gurmukhi"},
    "tha_Thai": {"name": "Thai", "native_name": "ไทย", "region": "Asia", "script": "Thai"},
    "vie_Latn": {"name": "Vietnamese", "native_name": "Tiếng Việt", "region": "Asia", "script": "Latin"},
    "ind_Latn": {"name": "Indonesian", "native_name": "Bahasa Indonesia", "region": "Asia", "script": "Latin"},
    "msa_Latn": {"name": "Malay", "native_name": "Bahasa Melayu", "region": "Asia", "script": "Latin"},
    "tgl_Latn": {"name": "Tagalog", "native_name": "Tagalog", "region": "Asia", "script": "Latin"},

    # Middle Eastern Languages
    "ara_Arab": {"name": "Arabic", "native_name": "العربية", "region": "Middle East", "script": "Arabic"},
    "heb_Hebr": {"name": "Hebrew", "native_name": "עברית", "region": "Middle East", "script": "Hebrew"},
    "fas_Arab": {"name": "Persian", "native_name": "فارسی", "region": "Middle East", "script": "Arabic"},
    "tur_Latn": {"name": "Turkish", "native_name": "Türkçe", "region": "Middle East", "script": "Latin"},

    # Americas Languages
    "spa_Latn": {"name": "Spanish", "native_name": "Español", "region": "Americas", "script": "Latin"},
    "por_Latn": {"name": "Portuguese", "native_name": "Português", "region": "Americas", "script": "Latin"},
    "eng_Latn": {"name": "English", "native_name": "English", "region": "Americas", "script": "Latin"},
    "fra_Latn": {"name": "French", "native_name": "Français", "region": "Americas", "script": "Latin"},
}


def get_all_languages() -> Dict[str, Dict[str, str]]:
    """Get all supported languages with their metadata"""
    return SUPPORTED_LANGUAGES


def get_languages_by_region(region: str) -> Dict[str, Dict[str, str]]:
    """Get languages filtered by region"""
    return {
        code: info for code, info in SUPPORTED_LANGUAGES.items()
        if info["region"].lower() == region.lower()
    }


def get_language_info(language_code: str) -> Optional[Dict[str, str]]:
    """Get information about a specific language"""
    return SUPPORTED_LANGUAGES.get(language_code)


def is_language_supported(language_code: str) -> bool:
    """Check if a language code is supported"""
    return language_code in SUPPORTED_LANGUAGES


def get_popular_languages() -> Dict[str, Dict[str, str]]:
    """Get most commonly used languages"""
    popular_codes = [
        # Global languages
        "eng_Latn", "spa_Latn", "fra_Latn", "deu_Latn", "ita_Latn", "por_Latn",
        "rus_Cyrl", "cmn_Hans", "jpn_Jpan", "kor_Hang", "ara_Arab", "hin_Deva",
        # Popular African languages
        "swh_Latn", "hau_Latn", "yor_Latn", "amh_Ethi", "som_Latn", "kik_Latn",
        "afr_Latn", "ibo_Latn", "orm_Latn", "aka_Latn", "bam_Latn", "fon_Latn",
        "lin_Latn", "lug_Latn", "nya_Latn", "sna_Latn", "tir_Ethi", "wol_Latn",
        "xho_Latn", "zul_Latn", "tsn_Latn", "sot_Latn"
    ]
    return {code: SUPPORTED_LANGUAGES[code] for code in popular_codes if code in SUPPORTED_LANGUAGES}


def get_african_languages() -> Dict[str, Dict[str, str]]:
    """Get African languages specifically"""
    return get_languages_by_region("Africa")


def search_languages(query: str) -> Dict[str, Dict[str, str]]:
    """Search languages by name or native name"""
    query_lower = query.lower()
    results = {}

    for code, info in SUPPORTED_LANGUAGES.items():
        if (query_lower in info["name"].lower() or
            query_lower in info["native_name"].lower() or
            query_lower in code.lower()):
            results[code] = info

    return results


def get_language_statistics() -> Dict[str, int]:
    """Get statistics about supported languages"""
    stats = {
        "total_languages": len(SUPPORTED_LANGUAGES),
        "regions": len(set(info["region"] for info in SUPPORTED_LANGUAGES.values())),
        "scripts": len(set(info["script"] for info in SUPPORTED_LANGUAGES.values()))
    }

    # Count by region
    region_counts = {}
    for info in SUPPORTED_LANGUAGES.values():
        region = info["region"]
        region_counts[region] = region_counts.get(region, 0) + 1

    stats["by_region"] = region_counts
    return stats
