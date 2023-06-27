import Box from "@mui/material/Box";
import styles from "./index.module.css";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import {ReactComponent as FacebookIcon} from "../../icons/facebook.svg";
import {ReactComponent as GmailIcon} from "../../icons/gmail.svg";
import {ReactComponent as GitHubIcon} from "../../icons/github.svg";
//@ts-ignore
import {AuthProvidersType, AuthProviderType} from "./index";

export const FROM_OPTIONS = {
  CURRENT: 'current',
}

const SocialAuthProviders = ({data}: {data:AuthProvidersType}) => {
  return (
    <Box sx={{ my: 1 }} className={styles['signin-form-social-media']}>
      <Typography>
        Login with:
      </Typography>
      <Box className={styles['signin-form-icons-container']}>
        {bindSocialtoNodes(data)}
      </Box>
    </Box>
  )
}

const bindSocialtoNodes = (socialOptions: AuthProvidersType) => {
  return socialOptions.map((option: any, i: number) => {
    if (option.name === 'facebook') {
      return getFacebookElement(i, normalizeUrl(option))
    } else if (option.name === 'google') {
      return getGmailElement(i, normalizeUrl(option))
    } else if (option.name === 'github') {
      return getGithubElement(i, normalizeUrl(option))
    }
    return null
  });
}

const normalizeUrl = (item: AuthProviderType) => {
  let url = item.url;

  if (item.from === FROM_OPTIONS.CURRENT) {
    item.from = window.location.href
  }

  if (item.site) {
    url += `?site=${item.site}`
  }

  if (item.site && item.from) {
    url += `&from=${item.from}`
  }

  if (!item.site && item.from) {
    url += `?from=${item.from}`
  }
  return url;
}

const getFacebookElement = (key: number, url:string) => <Link key={key} href={url}><FacebookIcon width={23} /></Link>
const getGmailElement = (key: number, url:string) => <Link key={key} href={url}><GmailIcon width={28} /></Link>
const getGithubElement = (key: number, url:string) => (<Link key={key} href={url}><GitHubIcon width={26} /></Link>)

export default SocialAuthProviders;
