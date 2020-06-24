<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--类别名称数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container">
          <el-input
            v-model="name"
            placeholder="请输入类别名称"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            style="margin-bottom: 20px"
          />
        </div>
        <div class="head-container">
          <el-tree
            :data="categoryOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--文章数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="标题" prop="title">
            <el-input
              v-model="queryParams.title"
              placeholder="请输入标题"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
              v-hasPerm="['article_add']"
            >新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleEdit"
              v-hasPerm="['article_edit']"
            >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDel"
              v-hasPerm="['article_del']"
            >删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="mini"
              @click="handleExport"
              v-hasPerm="['article_export']"
            >导出
            </el-button>
          </el-col>
          <div class="top-right-btn">
            <el-tooltip class="item" effect="dark" content="刷新" placement="top">
              <el-button size="mini" circle icon="el-icon-refresh" @click="handleQuery"/>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top">
              <el-button size="mini" circle icon="el-icon-search" @click="showSearch=!showSearch"/>
            </el-tooltip>
          </div>
        </el-row>

        <el-table v-loading="loading" :data="articleList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center"/>
          <el-table-column label="编号" align="center" prop="id" />
          <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true"/>
          <el-table-column label="类别名称" align="center" prop="categoryName"/>
          <el-table-column label="摘要" align="center" prop="summary" :show-overflow-tooltip="true"/>
          <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat"/>
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="240">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleEdit(scope.row)"
                v-hasPerm="['article_edit']"
              >修改
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDel(scope.row)"
                v-hasPerm="['article_del']"
              >删除
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-top"
                @click="handleUp(scope.row)"
                v-hasPerm="['article_edit']"
              >上移
              </el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-bottom"
                @click="handleDown(scope.row)"
                v-hasPerm="['article_edit']"
              >下移
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.current"
          :limit.sync="queryParams.size"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="1206px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="16">
            <el-form-item label="标题" prop="title">
              <el-input v-model="form.title" placeholder="请输入标题"/>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类别名称" prop="categoryId">
              <treeselect v-model="form.categoryId" :options="categoryOptions" :normalizer="normalizer"
                          placeholder="请选择类别名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="摘要" prop="summary">
              <el-input v-model="form.summary" type="textarea" rows="3" placeholder="请输入摘要"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容" prop="contents">
              <mavon-editor v-model="form.contents" ref=md @imgAdd="imgAdd" @imgDel="imgDel" style="min-height: 450px"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {listArticle, getArticle, delArticle, addArticle, editArticle, exportArticle, uploadFile, changeSort} from "@/api/cms/article";
  import {categoryTree} from "@/api/cms/category";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

  export default {
    name: "Article",
    components: {Treeselect},
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 文章表格数据
        articleList: [],
        // 弹出层标题
        title: "",
        // 类别名称树选项
        categoryOptions: undefined,
        // 是否显示弹出层
        open: false,
        // 类别名称
        name: undefined,
        // 日期范围
        dateRange: [],
        // 状态字典
        statusOptions: [],      // 查询参数
        queryParams: {
          current: 1,
          size: 10,
          title: undefined,
          categoryId: undefined,
          status: undefined,
        },
        // 显示搜索条件
        showSearch: true,
        // 表单参数
        form: {},
        defaultProps: {
          children: "children",
          label: "name"
        },
        // 表单校验
        rules: {
          title: [
            {required: true, message: "标题不能为空", trigger: "blur"}
          ],
          categoryId: [
            {required: true, message: "类别编号不能为空", trigger: "blur"}
          ],
        }
      };
    },
    watch: {
      // 根据名称筛选类别名称树
      name(val) {
        this.$refs.tree.filter(val);
      }
    },
    created() {
      this.getList();
      this.getCategoryTree();
      this.getDicts("status").then(response => {
        this.statusOptions = response.data;
      });
    },
    methods: {
      /** 查询文章列表 */
      getList() {
        this.loading = true;
        listArticle(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.articleList = response.data;
          this.total = response.total;
          this.loading = false;
        });
      },
      /** 转换类别数据结构 */
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children;
        }
        return {
          id: node.id,
          label: node.name,
          children: node.children
        };
      },
      /** 查询类别名称下拉树结构 */
      getCategoryTree() {
        categoryTree().then(response => {
          this.categoryOptions = response.data;
        });
      },
      // 筛选节点
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      // 节点单击事件
      handleNodeClick(data) {
        this.queryParams.categoryId = data.id;
        this.getList();
      },
      // 状态字典翻译
      statusFormat(row, column) {
        return this.selectDictLabel(this.statusOptions, row.status);
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          id: undefined,
          title: undefined,
          categoryId: undefined,
          categoryName: undefined,
          cover: undefined,
          summary: undefined,
          contents: undefined,
          sort: 0,
          status: "0"
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.current = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加文章";
      },
      /** 修改按钮操作 */
      handleEdit(row) {
        this.reset();
        const id = row.id || this.ids
        getArticle(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改文章";
        });
      },
      // 绑定@imgAdd event
      imgAdd(pos, $file){
        // 第一步.将图片上传到服务器.
        var formData = new FormData();
        formData.append('file', $file);
        uploadFile(formData).then(response => {
          if (response.code === 0) {
            // 第二步.将返回的url替换到文本原位置![...](0) -> ![...](url)
            // $vm.$img2Url 详情见本页末尾
            this.$refs.md.$img2Url(pos, 'http://' + location.host + process.env.VUE_APP_BASE_API + response.data);
          } else {
            this.msgError(response.msg);
          }
        });
      },
      imgDel(pos, url) {
        console.log(pos)
        console.log(url)
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs["form"].validate(valid => {
          if (valid) {
            let getNameById = (categoryId, categoryOptions) => {
              for (let i = 0; i < categoryOptions.length; i++) {
                if (categoryOptions[i].id === categoryId) {
                  return categoryOptions[i].name;
                }
                if (categoryOptions[i].children) {
                  return getNameById(categoryId, categoryOptions[i].children);
                }
              }
              return "";
            };
            this.form.categoryName = getNameById(this.form.categoryId, this.categoryOptions);
            if (this.form.id != undefined) {
              editArticle(this.form).then(response => {
                if (response.code === 0) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addArticle(this.form).then(response => {
                if (response.code === 0) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            }
          }
        });
      },
      /** 删除按钮操作 */
      handleDel(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除文章编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delArticle(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有文章数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportArticle(queryParams);
        }).then(response => {
          this.download(response.msg);
        }).catch(function () {
        });
      },
      handleUp(row){
        row.sort -= 1
        editArticle(row).then(response => {
          if (response.code === 0) {
            this.getList();
          } else {
            this.msgError(response.msg);
          }
        });
      },
      handleDown(row){
        row.sort += 1
        editArticle(row).then(response => {
          if (response.code === 0) {
            this.getList();
          } else {
            this.msgError(response.msg);
          }
        });
      }
    }
  };
</script>
