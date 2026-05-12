import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

type RenderedPageResult = {
  finalUrl: string;
  html: string;
  title?: string;
};

@Injectable()
export class PuppeteerResolverService {
  private readonly logger = new Logger(PuppeteerResolverService.name);
  private browser: puppeteer.Browser | null = null;

  async onModuleInit() {
    // Launch browser in the background when the module initializes
    try {
      this.logger.log('Iniciando navegador headless...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
        ],
      });
      this.logger.log('Navegador headless iniciado correctamente');
    } catch (error) {
      this.logger.error(`Error al iniciar navegador headless: ${String(error)}`);
      this.browser = null;
    }
  }

  async onModuleDestroy() {
    // Close browser when the module is destroyed
    if (this.browser) {
      try {
        await this.browser.close();
        this.logger.log('Navegador headless cerrado');
      } catch (error) {
        this.logger.error(`Error al cerrar navegador headless: ${String(error)}`);
      }
    }
  }

  async resolveUrlWithBrowser(url: string): Promise<string | undefined> {
    const rendered = await this.loadPageWithBrowser(url);
    return rendered?.finalUrl;
  }

  async loadPageWithBrowser(url: string): Promise<RenderedPageResult | undefined> {
    if (!this.browser) {
      this.logger.warn('Navegador headless no disponible, intentando lanzarlo...');
      try {
        await this.onModuleInit();
        if (!this.browser) {
          return undefined;
        }
      } catch {
        return undefined;
      }
    }

    let page: puppeteer.Page | null = null;
    try {
      this.logger.log(`Resolviendo URL con Puppeteer: ${url}`);
      page = await this.browser.newPage();

      // Set mobile user agent to match our HTTP strategy
      await page.setUserAgent(
        'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      );

      // Block unnecessary resources to speed up loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Navigate to the URL with timeout
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000,
      });

      // Wait a bit for any client-side redirects
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Get the final URL after all redirects
      const finalUrl = page.url();
      const html = await page.content();
      const title = await page.title();

      this.logger.log(`URL final resuelta con Puppeteer: ${finalUrl}`);

      await page.close();
      return {
        finalUrl,
        html,
        title,
      };
    } catch (error) {
      this.logger.warn(`Error al resolver URL con Puppeteer: ${String(error).slice(0, 200)}`);
      if (page) {
        try {
          await page.close();
        } catch {
          // ignore close error
        }
      }
      return undefined;
    }
  }
}
