export const zh = {
  // 导航
  nav: {
    home: '首页',
    restore: '照片修复',
    passportPhoto: '生证件照',
    studio: '蓝星照相馆',
  },
  // 用户操作
  user: {
    login: '登录',
    register: '注册',
    logout: '登出',
    subscribe: '订阅',
    manageSubscription: '管理订阅',
    loading: '加载中...',
    processing: '处理中...',
    email: '邮箱',
    credits: '积分',
    creditsBalance: '积分余额',
    creditsDescription: '每次生成照片消耗1积分',
    rechargeCredits: '充值积分',
    viewDetails: '查看详情',
    paymentSuccess: '支付成功！',
    creditsPurchased: '已成功购买 {{amount}} 积分',
    startUsing: '开始使用',
    backToCredits: '← 返回充值页面',
  },
  // 首页
  home: {
    title: '修复您的照片',
    subtitle: '使用 AI 技术恢复和增强您的珍贵照片',
    restoreButton: '修复您的照片',
    passportPhotoButton: '生成您的证件照',
    beforeExample: '修复前示例',
    afterExample: '修复后示例',
  },
  // 照片修复页面
  restore: {
    title: '照片修复',
    selectModel: '选择模型',
    uploadPhoto: '上传照片',
    originalPhoto: '原图',
    restoredPhoto: '修复后',
    regenerate: '重新生成',
    download: '下载',
    loading: '处理中...',
    error: '发生错误',
    fileSizeExceeded: '图片大小不能超过20MB',
    uploadNewPhoto: '上传新照片',
    usedModel: '使用模型',
    beforePhoto: '修复前照片',
    beforePhotoAlt: '修复前',
    largePreviewAlt: '大图预览',
    errorTitle: '错误',
    closeError: '关闭错误提示',
    sideBySide: '并排显示',
    compareSlider: '对比滑动',
    originalPhotoAlt: '原始照片',
    restoredPhotoAlt: '修复后照片',
    insufficientCredits: '您的积分不足，无法生成照片。请先充值积分。',
    loginRequired: '请先登录后才能使用照片修复功能。',
    serviceUnavailable: '服务暂时不可用',
    serviceUnavailableSuggestion: '请稍后再试或尝试切换模型',
    // Model names
    modelArkSDK: '方舟SDK',
    modelReplicate: 'Replicate',
    // Model descriptions
    arkSDKDesc: '方舟SDK: 豆包官方AI模型，色彩还原度高，细节更自然',
    replicateDesc: 'Replicate: 开源模型，响应速度较快',
    modelSwitchSuggestion: '建议您切换到另一个模型重试',
  },
  // 证件照页面
  passportPhoto: {
    title: '生成您的标准证件照',
    selectSize: '证件照尺寸',
    selectBackground: '背景颜色',
    selectClothing: '服装样式',
    selectModel: '生成模型',
    uploadPhoto: '上传照片',
    currentUsedModel: '当前使用模型',
    insufficientCredits: '您的积分不足，无法生成证件照。请先充值积分。',
    loginRequired: '请先登录后才能使用证件照生成功能。',
    serviceUnavailable: '服务暂时不可用',
    serviceUnavailableSuggestion: '请稍后再试或尝试切换模型',
    originalImage: '原图',
    originalImageLoadFailed: '原图加载失败',
    uploadedPhoto: '上传的照片',
    originalPhoto: '原始照片',
    generatedPhotoAlt: '生成的证件照',
    errorTitle: '错误',
    closeError: '关闭错误提示',
    generate: '生成证件照',
    loading: '生成中...',
    fileSizeExceeded: '图片大小不能超过20MB',
    uploadNewPhoto: '上传新照片',
    regenerate: '重新生成',
    download: '下载证件照',
    customSize: '自定义尺寸',
    customBackground: '自定义背景颜色',
    generatedPhoto: '生成的证件照',
    // Size options
    size1Inch: '1寸',
    size2Inch: '2寸',
    sizePassport: '护照',
    sizeCustom: '自定义',
    // Background colors
    bgWhite: '白',
    bgBlue: '蓝',
    bgRed: '红',
    bgCustom: '自定义',
    // Clothing styles
    clothingFormalShirt: '正装衬衫',
    clothingSuit: '西服',
    clothingCasual: '休闲装',
    // Model names
    modelArkSDK: '方舟SDK',
    modelReplicate: 'Replicate',
    // Model descriptions
    arkSDKDesc: '方舟SDK: 豆包官方AI模型，色彩还原度高，人像细节更自然',
    replicateDesc: 'Replicate: 第三方开源模型，响应速度较快，适合简单证件照生成',
    modelSwitchSuggestion: '建议您切换到另一个模型重试',
  },
  // 通用
  common: {
    language: '语言',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    chinese: '中文',
    english: 'English',
    uploadInstruction: '请在此处上传您的照片',
    uploadFormat: '支持 JPG、PNG 格式，或直接拖拽图片到下方区域',
    poweredBy: '由',
    and: '和',
    createdBy: '由',
    contactUs: '联系我们',
  },
  // 法律条款
  legal: {
    privacyPolicy: {
      title: '隐私政策',
      lastUpdated: '最后更新',
      sections: {
        introduction: {
          title: '1. 介绍',
          content: '蓝星照相馆（"我们"、"我们的"）致力于保护您的隐私。本隐私政策说明了我们如何收集、使用、存储和保护您的个人信息。使用我们的服务即表示您同意本政策的条款。',
        },
        dataCollection: {
          title: '2. 我们收集的数据',
          types: {
            title: '我们收集以下类型的数据：',
            photos: '您上传的照片（包括人脸信息）',
            accountInfo: '账户信息（邮箱地址、密码哈希）',
            paymentInfo: '支付信息（通过Stripe处理，我们不会存储完整信用卡信息）',
            usageData: '使用数据（生成次数、使用的模型等）',
          },
          sensitiveNote: '重要：您上传的照片属于敏感个人信息，我们承诺不会用于AI模型训练，也不会与第三方分享。',
        },
        thirdParty: {
          title: '3. 第三方服务',
          supabase: '用于用户认证和数据存储。您的账户信息和照片存储在Supabase的服务器上。',
          stripe: '用于处理支付。Stripe处理所有支付信息，我们不会存储您的完整信用卡信息。',
          vercel: '用于托管我们的网站和API。Vercel可能收集访问日志和性能数据。',
          bytescale: '用于图片上传和存储。您上传的照片通过Bytescale存储。',
        },
        dataUsage: {
          title: '4. 数据使用目的',
          purpose1: '提供照片修复和证件照生成服务',
          purpose2: '处理支付和积分管理',
          purpose3: '改善服务质量和用户体验',
          noTraining: '我们不会使用您的照片训练AI模型，也不会将您的照片用于任何商业目的。',
        },
        dataRetention: {
          title: '5. 数据保留和删除',
          automaticDeletion: '您上传的照片会在生成完成后自动删除，最长保留时间为7天。',
          userDeletion: '您可以随时通过账户设置删除您的照片和账户。删除后，您的数据将在30天内从我们的系统中完全清除。',
        },
        userRights: {
          title: '6. 您的权利',
          rights: '权利',
          access: '访问权：您可以请求访问我们持有的您的个人数据',
          deletion: '删除权：您可以请求删除您的个人数据',
          portability: '数据携带权：您可以请求以结构化格式导出您的数据',
          objection: '反对权：您可以反对我们处理您的个人数据',
          restriction: '限制处理权：您可以请求限制我们处理您的个人数据',
          ccpa: '根据CCPA（加州消费者隐私法），您有权要求我们不出售您的个人信息。我们不会出售您的个人信息。',
        },
        jurisdiction: {
          title: '7. 适用法律',
          content: '本隐私政策受您所在国家/地区的法律管辖。如果您在欧盟，适用GDPR；如果您在加州，适用CCPA。',
        },
        contact: {
          title: '8. 联系我们',
          content: '如果您对本隐私政策有任何疑问或希望行使您的权利，请通过以下方式联系我们：',
          email: '邮箱',
        },
      },
    },
    termsOfService: {
      title: '服务条款',
      lastUpdated: '最后更新',
      sections: {
        acceptance: {
          title: '1. 接受条款',
          content: '使用蓝星照相馆的服务即表示您同意遵守本服务条款。如果您不同意这些条款，请不要使用我们的服务。',
        },
        userResponsibility: {
          title: '2. 用户责任',
          ownPhotos: '您必须对上传的所有照片负责，确保您有权使用这些照片',
          noIllegal: '您不得上传非法、有害、威胁、辱骂、骚扰、诽谤、粗俗、色情或其他令人反感的内容',
          noThirdParty: '您不得为他人制作证件照，除非您已获得明确授权',
        },
        serviceDescription: {
          title: '3. 服务说明',
          content: '我们提供AI驱动的照片修复和证件照生成服务。服务使用第三方AI模型（方舟SDK和Replicate）处理您的照片。',
          noGuarantee: '重要：我们不保证生成的证件照会被任何官方机构接受。不同机构对证件照的要求可能不同，请在使用前确认具体要求。',
        },
        payment: {
          title: '4. 付款和使用限制',
          credits: '服务采用积分制，每次生成照片消耗1积分',
          refund: '积分购买后通常不可退款，除非因技术故障导致服务无法使用',
          currency: '所有价格以美元（USD）显示，实际支付货币可能因地区而异',
        },
        intellectualProperty: {
          title: '5. 知识产权',
          userOwnership: '您上传的照片归您所有。您保留对原始照片的所有权利。',
          platformOwnership: '生成的照片归您所有。我们的平台、代码和设计归我们所有。',
        },
        disclaimer: {
          title: '6. 免责声明',
          content: '我们不对AI生成的结果做出任何明示或暗示的保证。服务按"现状"提供，不保证准确性、完整性或适用性。',
        },
        termination: {
          title: '7. 终止和封禁',
          content: '我们保留因违反本条款而终止或暂停您账户的权利。如果您的账户被封禁，您将无法访问您的数据，但我们会根据GDPR要求提供数据导出选项。',
        },
        changes: {
          title: '8. 条款变更',
          content: '我们保留随时修改本服务条款的权利。重大变更将通过电子邮件或网站公告通知您。继续使用服务即表示您接受修改后的条款。',
        },
        contact: {
          title: '9. 联系我们',
          content: '如果您对本服务条款有任何疑问，请通过以下方式联系我们：',
          email: '邮箱',
        },
      },
    },
    refundPolicy: {
      title: '退款政策',
      lastUpdated: '最后更新',
      sections: {
        digitalContent: {
          title: '1. 数字内容政策',
          content: '由于我们提供的是数字服务（照片处理和生成），根据大多数司法管辖区的法律，数字内容通常不可退款。',
          note: '重要：积分购买后通常不可退款，除非因我们的技术故障导致服务完全无法使用。',
        },
        refundEligibility: {
          title: '2. 退款资格',
          technical: '因我们的技术故障导致服务无法使用',
          duplicate: '因系统错误导致重复扣费',
          unauthorized: '未经授权的交易',
        },
        subscription: {
          title: '3. 订阅和自动续费',
          autoRenewal: '如果您购买了订阅服务，订阅将自动续费，除非您取消。',
          cancellation: '您可以随时通过Stripe客户门户取消订阅。取消后，您将继续享受服务直到当前计费周期结束。',
          portalLink: '访问Stripe客户门户管理订阅',
        },
        processingTime: {
          title: '4. 处理时间',
          content: '如果您的退款请求被批准，退款将在5-10个工作日内处理。退款将返回到您原始支付方式。',
        },
        europeanRights: {
          title: '5. 欧洲消费者权利',
          content: '根据欧盟消费者保护法，如果您在欧盟，您可能有权在购买后14天内取消数字内容购买并获得退款，前提是您尚未开始使用服务。一旦您使用服务生成照片，此权利即失效。',
        },
        contact: {
          title: '6. 联系我们',
          content: '如需申请退款，请通过以下方式联系我们：',
          email: '邮箱',
        },
      },
    },
    cookiePolicy: {
      title: 'Cookie政策',
      lastUpdated: '最后更新',
      sections: {
        whatAreCookies: {
          title: '1. 什么是Cookie',
          content: 'Cookie是存储在您设备上的小文本文件，用于改善您的浏览体验和网站功能。',
        },
        types: {
          title: '2. 我们使用的Cookie类型',
          necessary: {
            title: '必要Cookie',
            content: '这些Cookie是网站正常运行所必需的，无法关闭。',
            supabase: '用于用户认证和会话管理',
          },
          functional: {
            title: '功能性Cookie',
            content: '这些Cookie用于记住您的偏好设置（如语言和主题）。',
          },
        },
        thirdParty: {
          title: '3. 第三方Cookie',
          supabase: 'Supabase使用Cookie进行用户认证',
          stripe: 'Stripe使用Cookie处理支付和防止欺诈',
        },
        management: {
          title: '4. Cookie管理',
          content: '您可以通过浏览器设置管理Cookie。请注意，禁用某些Cookie可能会影响网站功能。',
          note: '欧盟用户：首次访问时，我们会显示Cookie同意横幅，您可以选择接受或拒绝非必要Cookie。',
        },
        contact: {
          title: '5. 联系我们',
          content: '如果您对Cookie政策有任何疑问，请通过以下方式联系我们：',
          email: '邮箱',
        },
      },
    },
    dataProcessing: {
      title: '数据处理协议',
      lastUpdated: '最后更新',
      sections: {
        roles: {
          title: '1. 角色定义',
          controller: '蓝星照相馆是"数据控制者"（Data Controller），负责决定处理您个人数据的目的和方式。',
          processors: '以下第三方服务是"数据处理者"（Data Processor），代表我们处理您的数据：',
        },
        processors: {
          title: '2. 数据处理者',
          supabase: {
            data: '处理的数据：用户账户信息、认证令牌、上传的照片',
            purpose: '处理目的：用户认证、数据存储、会话管理',
            location: '数据处理位置：可能包括欧盟和美国',
          },
          stripe: {
            data: '处理的数据：支付信息、交易记录',
            purpose: '处理目的：处理支付、防止欺诈',
            location: '数据处理位置：全球（符合PCI DSS标准）',
          },
          vercel: {
            data: '处理的数据：访问日志、性能数据',
            purpose: '处理目的：网站托管、API服务',
            location: '数据处理位置：全球CDN',
          },
          bytescale: {
            data: '处理的数据：上传的照片',
            purpose: '处理目的：图片存储和传输',
            location: '数据处理位置：全球CDN',
          },
        },
        safeguards: {
          title: '3. 数据保护措施',
          content: '所有数据处理者都签署了数据处理协议，并实施了适当的技术和组织措施来保护您的数据。我们定期审查数据处理者的安全实践。',
        },
        contact: {
          title: '4. 联系我们',
          content: '如果您对数据处理有任何疑问，请通过以下方式联系我们：',
          email: '邮箱',
        },
      },
    },
    copyright: {
      title: '版权声明',
      lastUpdated: '最后更新',
      sections: {
        userContent: {
          title: '1. 用户内容所有权',
          ownership: '您上传的所有照片归您所有。您保留对原始照片的完整版权和所有权。',
          license: '通过上传照片，您授予我们有限的、非独占的许可，仅用于处理和生成您请求的结果。此许可在照片处理完成后即终止。',
        },
        platformContent: {
          title: '2. 平台内容所有权',
          ownership: '本网站的设计、代码、商标和所有其他内容归蓝星照相馆所有，受版权法保护。',
        },
        noTraining: {
          title: '3. 不用于AI训练',
          content: '我们承诺不会使用您的照片训练任何AI模型。您的照片仅用于生成您请求的结果，不会用于任何其他目的。',
        },
        noSharing: {
          title: '4. 不与第三方分享',
          content: '我们不会将您的照片分享给第三方，除非法律要求或您明确授权。',
        },
        contact: {
          title: '5. 联系我们',
          content: '如果您对版权有任何疑问，请通过以下方式联系我们：',
          email: '邮箱',
        },
      },
    },
    contact: {
      title: '联系我们 / 法律信息',
      sections: {
        company: {
          title: '1. 公司信息',
          name: '公司名称',
          value: '蓝星工作室（Blue Star Studio）',
          registered: '注册地',
          location: '中国',
        },
        contactInfo: {
          title: '2. 联系方式',
          general: '一般咨询',
          privacy: '隐私相关',
          legal: '法律相关',
          refunds: '退款相关',
        },
        dataProtection: {
          title: '3. 数据保护负责人',
          officer: '数据保护负责人',
          email: '邮箱',
        },
        gdprRights: {
          title: '3. GDPR权利请求',
          content: '根据GDPR，您有权：',
          right1: '访问您的个人数据',
          right2: '删除您的个人数据',
          right3: '更正不准确的个人数据',
          right4: '限制我们处理您的个人数据',
          right5: '反对我们处理您的个人数据',
          responseTime: '我们将在收到请求后30天内响应您的请求。',
        },
        responseTime: {
          title: '4. 响应时间',
          content: '我们致力于在收到您的询问后5个工作日内回复。对于复杂的法律或数据保护请求，可能需要最多30天。',
        },
      },
    },
  },
};

