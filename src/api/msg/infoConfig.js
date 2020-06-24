import request from '@/utils/request'

// 查询消息配置列表
export function listInfoConfig(query) {
  return request({
    url: '/msg/infoConfig/list',
    method: 'get',
    params: query
  })
}

// 查询消息配置详细
export function getInfoConfig(id) {
  return request({
    url: '/msg/infoConfig/' + id,
    method: 'get'
  })
}

// 新增消息配置
export function addInfoConfig(data) {
  return request({
    url: '/msg/infoConfig/save',
    method: 'post',
    data: data
  })
}

// 修改消息配置
export function editInfoConfig(data) {
  return request({
    url: '/msg/infoConfig/update',
    method: 'put',
    data: data
  })
}

// 删除消息配置
export function delInfoConfig(id) {
  return request({
    url: '/msg/infoConfig/remove/' + id,
    method: 'delete'
  })
}

// 导出消息配置
export function exportInfoConfig(query) {
  return request({
    url: '/msg/infoConfig/export',
    method: 'get',
    params: query
  })
}
