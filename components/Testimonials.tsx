// 移除Image导入，使用标准HTML img标签

const testimonials = [
  [
    {
      content:
        "刚刚获得了早期访问权限，效果非常惊人。由@vercel和@replicatehq提供技术支持 - 速度也很快。",
      link: 'https://twitter.com/rauchg/status/1612233034622984192',
      author: {
        name: 'Guillermo Rauch',
        role: 'CEO at Vercel',
        image: '/g.jpg',
      },
    },
    {
      content:
        '太棒了！在这个话题中，你可以看到整个开源技术栈可以立即部署到Vercel上',
      link: 'https://twitter.com/cramforce/status/1612496954218672128',
      author: {
        name: 'Malte Ubl',
        role: 'CTO at Vercel',
        image: '/malte.jpg',
      },
    },
  ],
  [
    {
      content:
        '我刚刚使用了这个网站，对其设计和功能印象非常深刻。感谢你们提供这么优秀的作品！继续加油！',
      link: 'https://twitter.com/phar_whaz/status/1612498030627852309',
      author: {
        name: 'Fawaz Adeniji',
        role: 'Software Engineer',
        image: '/fawaz.jpg',
      },
    },
    {
      content:
        '将模糊的照片变成清晰锐利的图像。效果简直像魔法一样',
      link: 'https://twitter.com/sergvind/status/1612610058369515521',
      author: {
        name: 'Sergei Vinderskikh',
        role: 'CPO at Treeum',
        image: '/sergei.jpg',
      },
    },
  ],
  [
    {
      content:
        "我刚刚使用了它，简直太棒了！我一定会再次使用的。做得好！",
      link: 'https://twitter.com/Himanil_Gole/status/1612510385504157697',
      author: {
        name: 'Himanil Gole',
        role: 'Designer & Founder at CBREX',
        image: '/himanil.jpg',
      },
    },
    {
      content:
        '哇，太感谢了！我尝试了几次，非常喜欢！我父亲70年代的照片（右侧是原图）真的被清理得很干净！',
      link: 'https://twitter.com/rod_ellison/status/1612513333302775809',
      author: {
        name: 'Rod Ellison',
        role: 'Software Engineer',
        image: '/rod.jpg',
      },
    },
  ],
];

export function Testimonials() {
  return (
    <section
      id='testimonials'
      aria-label='用户评价'
      className='py-10'>
      <div className='mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mx-auto md:text-center'>
          <h1 className='mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-slate-900 sm:text-6xl'>
            受到全球用户的喜爱
          </h1>
          <p className='mx-auto mt-6 max-w-xl text-lg text-slate-700 leading-7'>
            看看我们300,000+用户对产品的评价
          </p>
        </div>
        <ul
          role='list'
          className='mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-16 lg:max-w-none lg:grid-cols-3'
        >
          {testimonials.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role='list' className='flex flex-col gap-y-6 sm:gap-y-8'>
                {column.map((testimonial, testimonialIndex) => (
                  <li
                    key={testimonialIndex}
                    className='hover:scale-105 transition duration-300 ease-in-out'
                  >
                    <a href={testimonial.link} target='_blank' rel='noreferrer'>
                      <figure className='relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10'>
                        <blockquote className='relative'>
                          <p className='text-lg tracking-tight text-slate-900'>
                            "{testimonial.content}"
                          </p>
                        </blockquote>
                        <figcaption className='relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6'>
                          <div>
                            <div className='font-display text-base text-slate-900'>
                              {testimonial.author.name}
                            </div>
                            <div className='mt-1 text-sm text-slate-500'>
                              {testimonial.author.role === 'CEO at Vercel' ? 'Vercel 首席执行官' : 
                               testimonial.author.role === 'CTO at Vercel' ? 'Vercel 首席技术官' : 
                               testimonial.author.role === 'Software Engineer' ? '软件工程师' : 
                               testimonial.author.role === 'CPO at Treeum' ? 'Treeum 首席产品官' : 
                               testimonial.author.role === 'Designer & Founder at CBREX' ? 'CBREX 设计师 & 创始人' : 
                               testimonial.author.role}
                            </div>
                          </div>
                          <div className='overflow-hidden rounded-full bg-slate-50'>
                            <img
                        alt='评价者照片'
                        src={testimonial.author.image}
                        className='h-14 w-14 object-cover'
                        width={56}
                        height={56}
                      />
                          </div>
                        </figcaption>
                      </figure>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
