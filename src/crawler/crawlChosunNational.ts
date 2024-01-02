import axios from 'axios';
import * as cheerio from 'cheerio';

export async function crawlChosunNational() {
  try {
    // 크롤링할 페이지의 URL
    const url = 'https://www.chosun.com/national/';

    // axios를 사용하여 HTML을 가져옴
    const response = await axios.get(url);
    // HTML을 cheerio로 로드
    const $ = cheerio.load(response.data);

    // 원하는 섹션의 기사를 선택
    const articles = $('div.story-feed div');

    // 각 기사에 대한 정보 출력
    for (const element of articles) {
      // 기사의 링크 가져오기
      const link = $(element).find('div.story-card-component a').attr('href');

      // 각 기사의 링크로 요청을 보내어 기사 내용 가져오기
      const articleResponse = await axios.get(link);
      const articleHtml = articleResponse.data;
      const $article = cheerio.load(articleHtml);

      // 기사 내용 출력
      const title = $article('.article-header__headline').text().trim();
      // const content = $article('#dic_area').text().trim();

      console.log(`Title: ${title}`);
      // console.log(`Content: ${content}`);
      console.log('-------------------');
    }
  } catch (error) {
    // console.error(`Error: ${error}`);
  }
}

// 함수를 export
export default crawlChosunNational;
