"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const Scraper_1 = __importDefault(require("./Scraper"));
class GoogleSearch {
    constructor() {
        this.scraper = new Scraper_1.default();
    }
    execute(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const resultUrls = yield this._search(query);
            const resultData = this.scraper.scrape(resultUrls);
            return JSON.stringify(resultData);
        });
    }
    _search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get('https://www.google.com/search', {
                params: { q: query },
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:89.0) Gecko/20100101 Firefox/89.0'
                }
            });
            const $ = cheerio_1.default.load(response.data);
            const links = $('#search span>a'); // TODO This is flaky
            const resultUrls = [];
            links.each((index, element) => {
                if (index < 3) { // TODO improve this
                    resultUrls.push($(element).attr('href') || '');
                }
            });
            return resultUrls;
        });
    }
}
exports.default = GoogleSearch;
