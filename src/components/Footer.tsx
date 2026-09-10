import {BsWhatsapp} from 'react-icons/bs'
import {BsFacebook} from 'react-icons/bs'
import {BsInstagram} from 'react-icons/bs'
import {IoLogoTwitter} from 'react-icons/io'
import {SiGmail} from 'react-icons/si'
const Footer = () => {
  return (
    <footer>
        <div className="foot-container">
            <div className="foot">
                <ul>
                    <li>
                        <a href="" >
                            <BsWhatsapp className='footer-icon'/>
                        </a>
                        <a href="" >
                            <BsFacebook className='footer-icon'/>
                        </a>
                        <a href="" >
                            <BsInstagram className='footer-icon'/>
                        </a>
                        <a href="" >
                            <IoLogoTwitter className='footer-icon'/>
                        </a>
                        <a href="" >
                            <SiGmail className='footer-icon'/>
                        </a>
                    </li>
                </ul>
            </div>
            <div className="foot">
                <div className="footer-input-container">
                    <input type="text" className='footer-input' placeholder='sign up for our newsletter'/>
                    <div className="gmail-container">
                        <SiGmail />
                    </div>
                </div>
            </div>
        </div>
    </footer>
  )
}

export default Footer