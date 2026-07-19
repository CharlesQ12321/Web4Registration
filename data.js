window.siteData = {
  "installGuide": {
    "title": "IronMan插件安装激活流程",
    "stepGroups": [
      {
        "steps": [
          {
            "number": 1,
            "text": "安装包解压缩后将IronMan文件夹放到Grasshopper的Libraries文件夹下。位置错误将无法激活。"
          }
        ],
        "image": "%E5%AE%89%E8%A3%85%E6%BF%80%E6%B4%BB%E8%AF%B4%E6%98%8E/%E5%9B%BE%E7%89%872.png"
      },
      {
        "steps": [
          {
            "number": 2,
            "text": "进入Grasshopper后，用IronMan插件的GhcRegister电池获取本机用户码。"
          }
        ],
        "image": "%E5%AE%89%E8%A3%85%E6%BF%80%E6%B4%BB%E8%AF%B4%E6%98%8E/%E5%9B%BE%E7%89%873.png"
      },
      {
        "steps": [
          {
            "number": 3,
            "text": "在这里输入用户码，点击按钮生成激活码。 👉"
          }
        ],
        "image": "activation-form"
      },
      {
        "steps": [
          {
            "number": 4,
            "text": "复制激活码并黏贴到IronManLicense.lic文件中替换原始内容。"
          }
        ],
        "image": "%E5%AE%89%E8%A3%85%E6%BF%80%E6%B4%BB%E8%AF%B4%E6%98%8E/%E5%9B%BE%E7%89%875.png"
      },
      {
        "steps": [
          {
            "number": 5,
            "text": "重新加载Grasshopper，用IronMan插件的ValidityPeriod电池查看插件有效期。"
          },
          {
            "number": 6,
            "text": "IronMan插件过期后需下载并安装新版本文件。"
          }
        ],
        "image": "%E5%AE%89%E8%A3%85%E6%BF%80%E6%B4%BB%E8%AF%B4%E6%98%8E/%E5%9B%BE%E7%89%876.png"
      }
    ],
    "images": [
      "%E5%AE%89%E8%A3%85%E6%BF%80%E6%B4%BB%E8%AF%B4%E6%98%8E/%E5%9B%BE%E7%89%872.png",
      "%E5%AE%89%E8%A3%85%E6%BF%80%E6%B4%BB%E8%AF%B4%E6%98%8E/%E5%9B%BE%E7%89%873.png",
      "%E5%AE%89%E8%A3%85%E6%BF%80%E6%B4%BB%E8%AF%B4%E6%98%8E/%E5%9B%BE%E7%89%875.png",
      "%E5%AE%89%E8%A3%85%E6%BF%80%E6%B4%BB%E8%AF%B4%E6%98%8E/%E5%9B%BE%E7%89%876.png"
    ],
    "downloadUrl": "https://pan.baidu.com/s/1A6McfzgdiZvJ67Co9I9yVA?pwd=rg95",
    "downloadCode": "rg95"
  },
  "caseStudies": [
    {
      "title": "ALC横条板排布",
      "description": "“ALC横条板排布”GH脚本是一位初学者的作品。但是这份作品完整地呈现了对一个建筑立面图进行ALC横条板排布的效果。GH脚本不仅呈现了排布后的效果，还能提供多种排布逻辑供设计师选用。它的执行目标是用最少的异形板块数量、最高的板块利用率来填满整个建筑立面。建筑师再也不用手动一块一块地去进行立面排版了。",
      "images": [
        "%E5%BA%94%E7%94%A8%E6%A1%88%E4%BE%8B%E5%B1%95%E7%A4%BA/ALC%E6%A8%AA%E6%9D%A1%E6%9D%BF%E6%8E%92%E5%B8%83/%E5%9B%BE%E7%89%871.png",
        "%E5%BA%94%E7%94%A8%E6%A1%88%E4%BE%8B%E5%B1%95%E7%A4%BA/ALC%E6%A8%AA%E6%9D%A1%E6%9D%BF%E6%8E%92%E5%B8%83/%E5%9B%BE%E7%89%872.png"
      ]
    },
    {
      "title": "超限梁柱支撑截面调整",
      "description": "“超限梁柱支撑截面调整”GH脚本可以实现对钢框架、PEC框架结构的梁、柱、支撑构件进行优化调整。GH脚本通过从YJK计算结果中读取结果数据，以图形形式展现在rhino窗口中。用户可以自定义优化参数，通过IronMan插件驱动GH脚本进行多轮构件截面优化迭代。赋予设计师设计自由度的同时，极大地提高设计师调模型工作效率。优化流程执行过程中需结合Euler插件进行数据读写。",
      "images": [
        "%E5%BA%94%E7%94%A8%E6%A1%88%E4%BE%8B%E5%B1%95%E7%A4%BA/%E8%B6%85%E9%99%90%E6%A2%81%E6%9F%B1%E6%94%AF%E6%92%91%E6%88%AA%E9%9D%A2%E8%B0%83%E6%95%B4/%E5%9B%BE%E7%89%871.png",
        "%E5%BA%94%E7%94%A8%E6%A1%88%E4%BE%8B%E5%B1%95%E7%A4%BA/%E8%B6%85%E9%99%90%E6%A2%81%E6%9F%B1%E6%94%AF%E6%92%91%E6%88%AA%E9%9D%A2%E8%B0%83%E6%95%B4/%E5%9B%BE%E7%89%873.png",
        "%E5%BA%94%E7%94%A8%E6%A1%88%E4%BE%8B%E5%B1%95%E7%A4%BA/%E8%B6%85%E9%99%90%E6%A2%81%E6%9F%B1%E6%94%AF%E6%92%91%E6%88%AA%E9%9D%A2%E8%B0%83%E6%95%B4/%E5%9B%BE%E7%89%874.png",
        "%E5%BA%94%E7%94%A8%E6%A1%88%E4%BE%8B%E5%B1%95%E7%A4%BA/%E8%B6%85%E9%99%90%E6%A2%81%E6%9F%B1%E6%94%AF%E6%92%91%E6%88%AA%E9%9D%A2%E8%B0%83%E6%95%B4/%E5%9B%BE%E7%89%875.png"
      ]
    }
  ],
  "qrCodes": [
    {
      "name": "量化结构设计B站视频号",
      "src": "%E7%AB%99%E7%82%B9%E4%BA%8C%E7%BB%B4%E7%A0%81/%E9%87%8F%E5%8C%96%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1B%E7%AB%99%E8%A7%86%E9%A2%91%E5%8F%B7.jpg"
    },
    {
      "name": "量化结构设计微信公众号",
      "src": "%E7%AB%99%E7%82%B9%E4%BA%8C%E7%BB%B4%E7%A0%81/%E9%87%8F%E5%8C%96%E7%BB%93%E6%9E%84%E8%AE%BE%E8%AE%A1%E5%BE%AE%E4%BF%A1%E5%85%AC%E4%BC%97%E5%8F%B7.jpg"
    }
  ],
  "partners": [
    {
      "name": "精工钢构集团",
      "src": "%E5%90%88%E4%BD%9C%E5%8D%95%E4%BD%8D/%E7%B2%BE%E5%B7%A5%E9%92%A2%E7%BB%93%E6%9E%84%E9%9B%86%E5%9B%A2.png",
      "url": "https://www.600496.com/"
    },
    {
      "name": "同济大学建筑设计研究院",
      "src": "%E5%90%88%E4%BD%9C%E5%8D%95%E4%BD%8D/%E5%90%8C%E6%B5%8E%E5%A4%A7%E5%AD%A6%E5%BB%BA%E7%AD%91%E8%AE%BE%E8%AE%A1%E7%A0%94%E7%A9%B6%E9%99%A2.png",
      "url": "http://www.tjad.cn/",
      "scale": 0.8
    }
  ]
};
