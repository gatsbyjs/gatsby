// created this singalton class as a quick way to reference options anywhere within the plugin

class PluginOptions {
  #shopName;

  #accessToken;

  #apiVersion;

  #verbose;

  #paginationSize;

  #includeCollections;

  #downloadImages;

  #defaultImageUrl;

  get shopName() {
    return this.#shopName;
  }

  get accessToken() {
    return this.#accessToken;
  }

  get apiVersion() {
    return this.#apiVersion || '2020-01';
  }

  get verbose() {
    return this.#verbose || true;
  }

  get paginationSize() {
    return this.#paginationSize || 250;
  }

  get includeCollections() {
    return this.#includeCollections || ['shop', 'content'];
  }

  get downloadImages() {
    return this.#downloadImages;
  }

  get defaultImageUrl() {
    return this.#defaultImageUrl;
  }

  setShopName(shopName) {
    this.#shopName = shopName;
    return this;
  }

  setAccessToken(accessToken) {
    this.#accessToken = accessToken;
    return this;
  }

  setApiVersion(apiVersion) {
    this.#apiVersion = apiVersion;
    return this;
  }

  setVerbose(verbose) {
    this.#verbose = verbose;
    return this;
  }

  setPaginationSize(paginationSize) {
    this.#paginationSize = paginationSize;
    return this;
  }

  setIncludeCollections(includeCollections) {
    this.#includeCollections = includeCollections;
    return this;
  }

  setDownloadImages(downloadImages) {
    this.#downloadImages = downloadImages;
    return this;
  }

  setDefaultImageUrl(defaultImageUrl) {
    this.#defaultImageUrl = defaultImageUrl;
    return this;
  }
}

export default new PluginOptions();
