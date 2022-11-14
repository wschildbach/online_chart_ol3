/**
* @license AGPL-3.0
* @author mojoaxel (https://github.com/mojoaxel)
*/
'use strict'
import './Links.scss'

import React from 'react'
import PropTypes from 'prop-types'
import MdDownload from 'react-icons/lib/md/file-download'
import FaLink from 'react-icons/lib/fa/external-link'

const LinkPropTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  href: PropTypes.string.isRequired,
  title: PropTypes.string
}

/**
 * normal Link.
 */
export const NormalLink = (props) => (
  <a
    role='link'
    href={props.href}
    title={props.title || ''}
    {...props}>
    { props.children }
  </a>
)
NormalLink.propTypes = LinkPropTypes

/**
 * Link to external page.
 */
export const ExternalLink = (props) => (
  <NormalLink
    className='external'
    target='_blank'
    {...props}>
    { props.children }
    {' '}
    <FaLink />
  </NormalLink>
)
ExternalLink.propTypes = LinkPropTypes

/**
 * Link to file to download
 */
export const DownloadLink = (props) => (
  <NormalLink
    className='download'
    target='_blank'
    {...props}>
    { props.children }
    {' '}
    <MdDownload />
  </NormalLink>
)
DownloadLink.propTypes = LinkPropTypes
