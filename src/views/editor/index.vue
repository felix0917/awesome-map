<template>
  <div class="editor">
    <el-container>
      <!-- 代码编辑器区（左侧） -->
      <el-aside
        :style="{
          width: !isEditorVisible ? '0px !important' : '630px !important',
        }"
      >
        <el-container>
          <el-header>
            <h4 class="editor-title">源码编辑器</h4>
            <div class="el-icon-refresh-left" @click="run">运行</div>
            <div class="el-icon-video-play" @click="reset">重置</div>
          </el-header>
          <el-main class="editor-content">
            <select
              v-model="activeEditorType"
              @change="activeEditorTypeChange"
              class="languageSelect"
              ><option value="js-editor">JavaScript</option
              ><option value="html-editor">HTML</option
              ><option value="css-editor">CSS</option>
            </select>
            <div class="divider" v-if="isEditorVisible"></div>
            <select
              v-model="editorConfig.theme"
              @change="themeTypeChange"
              class="themeSelect"
              ><option value="vs-dark">vs-dark</option
              ><option value="vs">vs</option
              ><option value="hc-black">hc-black</option>
            </select>
            <div class="divider" v-if="isEditorVisible"></div>
            <select
              v-model="editorConfig.fontSize"
              @change="fontSizeChange"
              class="fontSizeSelect"
              ><option
                v-for="fontsize in fontSizeArr"
                :value="fontsize"
                :key="fontsize"
                >{{ fontsize }}</option
              >
            </select>
            <div
              v-show="activeEditorType === 'js-editor'"
              ref="js-editor"
              class="js-editor"
            ></div>
            <div
              v-show="activeEditorType === 'html-editor'"
              ref="html-editor"
              class="html-editor"
            ></div>
            <div
              v-show="activeEditorType === 'css-editor'"
              ref="css-editor"
              class="css-editor"
            ></div>
          </el-main>
        </el-container>
      </el-aside>
      <!-- 效果展示区（右侧） -->
      <el-main class="display-content">
        <div
          class="codeVisibleButton"
          :style="{ left: !isEditorVisible ? '3px' : 'calc(40.5% + 10px)' }"
          @click="isEditorVisible = !isEditorVisible"
        >
          <span v-if="!isEditorVisible">
            <i class="fa fa-arrows-alt"></i>源码
          </span>
          <span v-if="isEditorVisible">
            <i class="fa fa-compress"></i>收缩
          </span>
        </div>
        <div class="example" ref="example" style="height:100%;width:100%;"></div
      ></el-main>
    </el-container>
  </div>
</template>

<script>
import * as axios from "axios";
import * as monaco from "monaco-editor";

export default {
  name: "Editor",
  data() {
    return {
      // 沙盒示例类型名
      type: "",
      // 沙盒示例名
      example: "",
      // 代码编辑器是否可见
      isEditorVisible: false,
      // 默认代码编辑器配置
      editorConfig: {
        theme: "vs-dark",
        formatOnPaste: true,
        fontSize: 14,
        scrollbar: {
          verticalScrollbarSize: 2,
        },
      },
      // 编辑器字体大小选择
      fontSizeArr: [12, 13, 14, 15],
      // 当前显示代码类型
      activeEditorType: "js-editor",
      // 模板HTML文件(temp.html)
      tempHtml: "",
      // 需要导入的第三方库
      importModules: [],
      // 原始JavaScript
      oriJavaScriptStr: "",
      // 原始HTML
      oriHtmlStr: "",
      // 原始CSS
      oriCssStr: "",
      // 当前JavaScript
      currJavaScriptStr: "",
      // 当前HTML
      currHtmlStr: "",
      // 当前CSS
      currCssStr: "",
      // JavaScript编辑器
      jsEditor: null,
      // HTML编辑器
      htmlEditor: null,
      // CSS编辑器
      cssEditor: null,
    };
  },
  watch: {
    isEditorVisible(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.createEditor();
        });
      }
    },
  },
  mounted() {
    // 取消页面鼠标右击菜单和选择事件
    document.oncontextmenu = new Function("event.returnValue=false");
    document.onselectstart = new Function("event.returnValue=false");

    this.$nextTick(() => {
      this.getExamplePathInfo();

      axios.all([this.getTempPage(), this.getExamplePage()]).then(
        axios.spread((tempPage, examplePage) => {
          this.tempHtml = tempPage.data;
          let exampleHtml = examplePage.data;
          if (exampleHtml && this.tempHtml) {
            let importStart = exampleHtml.indexOf("import");
            let importEnd = exampleHtml.indexOf(";");
            let jsIndexStart = exampleHtml.indexOf("<script>");
            let jsIndexEnd = exampleHtml.indexOf("</" + "script>");
            let cssIndexStart = exampleHtml.indexOf("<style>");
            let cssIndexEnd = exampleHtml.indexOf("</style>");

            let importModulesStr = exampleHtml.substring(
              importStart,
              importEnd + 1
            );
            this.importModules = importModulesStr
              .replace("import", "")
              .replace(";", "")
              .trim()
              .split(",");
            this.oriJavaScriptStr = exampleHtml
              .substring(jsIndexStart, jsIndexEnd)
              .replace(/<script>/, "")
              .trim();
            this.oriCssStr = exampleHtml
              .substring(cssIndexStart, cssIndexEnd)
              .replace(/<style>/, "")
              .trim();
            let scriptStr = exampleHtml.match(
              /\<script>[\s\S]*?\<\/script>/g
            )[0];
            let styleStr = exampleHtml.match(/\<style>[\s\S]*?\<\/style>/g)[0];
            this.oriHtmlStr = exampleHtml
              .replace(importModulesStr, "")
              .replace(scriptStr, "")
              .replace(styleStr, "")
              .trim();

            this.currJavaScriptStr = this.oriJavaScriptStr;
            this.currHtmlStr = this.oriHtmlStr;
            this.currCssStr = this.oriCssStr;

            this.loadExample();
          }
        })
      );
    });
  },
  methods: {
    // 获取沙盒类型和名称
    getExamplePathInfo() {
      if (this.$route) {
        let query = this.$route.query;
        this.type = query.type;
        this.example = query.example;
      }
    },
    // 创建代码编辑器
    createEditor() {
      switch (this.activeEditorType) {
        case "js-editor":
          this.createJsEditor();
          break;
        case "html-editor":
          this.createHtmlEditor();
          break;
        case "css-editor":
          this.createCssEditor();
          break;
        default:
          break;
      }
    },
    // 创建JS编辑器
    createJsEditor() {
      if (!this.jsEditor) {
        this.jsEditor = monaco.editor.create(this.$refs["js-editor"], {
          language: "javascript",
          ...this.editorConfig,
        });
      }

      this.jsEditor.setValue(this.currJavaScriptStr);

      // 初始化调用代码格式化
      this.jsEditor.getAction(["editor.action.formatDocument"])._run();
    },
    // 创建HTML编辑器
    createHtmlEditor() {
      if (!this.htmlEditor) {
        this.htmlEditor = monaco.editor.create(this.$refs["html-editor"], {
          language: "html",
          ...this.editorConfig,
        });
      }

      this.htmlEditor.setValue(this.currHtmlStr);
      this.htmlEditor.getAction(["editor.action.formatDocument"])._run();
    },
    // 创建CSS编辑器
    createCssEditor() {
      if (!this.cssEditor) {
        this.cssEditor = monaco.editor.create(this.$refs["css-editor"], {
          language: "css",
          ...this.editorConfig,
        });
      }

      this.cssEditor.setValue(this.currCssStr);
      this.cssEditor.getAction(["editor.action.formatDocument"])._run();
    },
    // 重置代码
    reset() {
      this.currJavaScriptStr = this.oriJavaScriptStr;
      this.currHtmlStr = this.oriHtmlStr;
      this.currCssStr = this.oriCssStr;
      this.jsEditor && this.jsEditor.setValue(this.currJavaScriptStr);
      this.htmlEditor && this.htmlEditor.setValue(this.currHtmlStr);
      this.cssEditor && this.cssEditor.setValue(this.currCssStr);
      this.loadExample();
    },
    // 运行代码
    run() {
      this.currJavaScriptStr = this.jsEditor
        ? this.jsEditor.getValue()
        : this.oriJavaScriptStr;
      this.currHtmlStr = this.htmlEditor
        ? this.htmlEditor.getValue()
        : this.oriHtmlStr;
      this.currCssStr = this.cssEditor
        ? this.cssEditor.getValue()
        : this.oriCssStr;

      this.loadExample();
    },
    // 加载示例
    loadExample() {
      let iFrame = this.createIFrame();
      iFrame.style.height = "100%";
      iFrame.style.width = "100%";
      iFrame.style.border = "0px";
      let iframeDocument = iFrame.contentWindow.document;
      iframeDocument.open();
      let headContent = "<style>" + this.currCssStr + "</style>";
      let bodyContent =
        this.currHtmlStr +
        "<script>" +
        this.currJavaScriptStr +
        "<" +
        "/script>";
      let content = this.tempHtml
        .replace("<StyleTemp />", headContent)
        .replace("<Element&ScriptTemp />", bodyContent);

      // 选择性导入第三方包
      this.importModules.forEach((module) => {
        let moduleEleStart = "<!--" + module + ">";
        let moduleEleEnd = "</" + module + "-->";
        content = content.replace(moduleEleStart, "").replace(moduleEleEnd, "");
      });

      iframeDocument.write(content);
      iframeDocument.close();

      // 自动格式化代码
      this.jsEditor &&
        this.jsEditor.getAction(["editor.action.formatDocument"])._run();
      this.htmlEditor &&
        this.htmlEditor.getAction(["editor.action.formatDocument"])._run();
      this.cssEditor &&
        this.cssEditor.getAction(["editor.action.formatDocument"])._run();
    },
    // 创建iframe
    createIFrame() {
      let examplePage = this.$refs["example"];
      examplePage.innerHTML = "";
      let iframe = document.createElement("iframe");
      iframe.setAttribute("id", "innerPage");
      iframe.setAttribute("name", "innerPage");
      examplePage.append(iframe);
      return iframe;
    },
    // 获取temp.html页面代码
    getTempPage() {
      return this.$http.get("sandcastle/gallary/temp.html");
    },
    // 获取示例页面代码
    getExamplePage() {
      return axios.get(`sandcastle/gallary/${this.type}/${this.example}.html`);
    },
    // 编辑器语言切换
    activeEditorTypeChange() {
      this.$nextTick(() => {
        this.createEditor();
      });
    },
    // 编辑器主题切换
    themeTypeChange() {
      this.$nextTick(() => {
        monaco.editor.setTheme(this.editorConfig.theme);
      });
    },
    // 编辑器字体切换
    fontSizeChange() {
      this.$nextTick(() => {
        let fontSize = this.editorConfig.fontSize;
        document.getElementsByClassName("view-lines").forEach((view) => {
          view.setAttribute(
            "style",
            "font-size:" +
              fontSize +
              "px;" +
              "font-family: Consolas, 'Courier New', monospace;"
          );
        });
      });
    },
  },
};
</script>

<style lang="less" scoped>
.editor {
  height: 100%;
  .el-container {
    height: 100%;
    .el-aside {
      box-shadow: 2px 0 6px #ccc;
      .el-header {
        height: 34px !important;
        padding: 4px;
        box-shadow: 0 2px 10px #ddd;
        > h4 {
          display: inline-block;
          margin: 2px;
          color: #76838f;
        }
        > div {
          float: right;
          width: 60px;
          height: 24px;
          line-height: 24px;
          text-align: center;
          cursor: pointer;
        }
        :hover {
          color: #0083cb;
          font-weight: 600;
        }
      }
      .el-main {
        padding: 0px;
        > select {
          color: #0083cb;
          height: 22px;
          border: none;
        }
        .languageSelect {
          width: 50%;
        }
        .themeSelect {
          width: 25%;
        }
        .fontSizeSelect {
          width: 25%;
        }
        :focus {
          outline: none;
        }
      }
    }
  }
}
.el-aside {
  height: 100%;
  width: 630px;
}
.editor-content {
  overflow: hidden;
  padding: 0 2px;
  .js-editor,
  .html-editor,
  .css-editor {
    height: 1000px;
    width: 100%;
  }
}
.display-content {
  padding: 0px;
}
.codeVisibleButton {
  cursor: pointer;
  z-index: 900;
  position: absolute;
  top: 31px;
  padding: 0 2px;
  min-width: 54px;
  height: 25px;
  line-height: 25px;
  margin: 4px;
  text-align: center;
  background-color: rgba(34, 45, 50, 0.7);
  color: #fff;
}
.divider {
  display: inline-block;
  border: 1px solid #909399de;
  height: 15px;
  position: absolute;
  margin-top: 3.5px;
}
</style>
