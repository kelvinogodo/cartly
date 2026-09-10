const Contact = () => {
  return (
    <section className='contact-section'>
        <div className="advert-section">
            <div className="advert-text-container">
                <h5>we make you look magnificent</h5>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odit temporibus obcaecati rem, reiciendis itaque repellendus. Asperiores doloribus earum dignissimos tempora?</p>
                <button className="visit-blog-btn">visit blog</button>
            </div>
            <img src="images/designer-mens-suits-500x500-removebg-preview.png" alt="" className="advert-img" />
        </div>
        <div className="form-section">
            <img src="images/preview (2).png" alt="" className="contact-img" />
            <form className="contact-form">
                <h5 className="contact-form-header">
                    contact us
                    <span className="line"></span>
                </h5>
                <input type="text" className="contact-input" placeholder='enter your email'/>
                <textarea placeholder='type your message here' name="" id="" className="contact-text-area">
                </textarea>
                <input type="button" value="send" className='contact-submit-btn'/>
            </form>
        </div>
    </section>
  )
}

export default Contact