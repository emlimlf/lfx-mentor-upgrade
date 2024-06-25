import { environment } from 'environments/environment';

const IS_DEBUG_ENABLED = !environment.production;

export function info(text = '', value: any = null, prefix = '') {
  if (!IS_DEBUG_ENABLED) {
    return;
  }

  if (typeof text !== 'string') {
    value = text;
    text = '(notext)';
  }

  text = `(${prefix}) ${text}`;

  const date = new Date().toISOString();

  if (!value) {
    console.log('' + text);
    return;
  }

  const id = Math.floor(Math.random() * 1000000);
  console.group('%c' + date + '-' + id + `-${text}`, 'color: yellow');
  // const newValue = JSON.parse(JSON.stringify(value, null, 2));
  const newValue = JSON.stringify(value, null, 2);
  console.log('' + text, newValue);
  console.groupEnd();
}

export function factoryLog(prefix: any) {
  return function(text: any, value: any = '') {
    return info(text, value, prefix);
  };
}
