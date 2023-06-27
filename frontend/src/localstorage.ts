class Localstorage {
  static get(key: string) {
    return localStorage.getItem(key);
  }

  static set(key: string, value: string) {
    localStorage.setItem(key, value);
  }

  static remove(key: string) {
    localStorage.removeItem(key);
  }

  static setUser(userInfo: any) {
    this.set('user', JSON.stringify(userInfo));
  }

  static removeUser() {
    this.remove('user');
  }

  static getUser() {
    const userInfo = this.get('user');
    if (userInfo) {
      JSON.parse(userInfo);
      return JSON.parse(userInfo);
    }
    return undefined;
  }
}

export default Localstorage;